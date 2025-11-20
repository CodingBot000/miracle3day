import { NextRequest, NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';
import { getUserAPIServer } from '@/app/api/auth/getUser/getUser.server';
import { toShortId } from '@/lib/stream/utils';
import { q } from '@/lib/db';
import { TABLE_HOSPITAL } from '@/constants/tables';

/**
 * Stream Chat 채널 초기화 API
 * POST /api/stream/init-channel
 *
 * 서버에서 다음 작업을 수행:
 * 1. 고객 유저 upsert
 * 2. 병원 유저 upsert
 * 3. 채널 생성 또는 재사용
 * 4. 고객용 토큰 생성
 * 5. token, apiKey, channelId 반환
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 요청 바디 파싱
    const body = await req.json();
    const { hospitalId } = body;

    if (!hospitalId) {
      return NextResponse.json(
        { ok: false, error: 'hospitalId is required' },
        { status: 400 }
      );
    }

    // 2. 로그인된 사용자 정보 가져오기
    const userResult = await getUserAPIServer();

    if (!userResult || !userResult.userInfo) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const userId = userResult.userInfo.id_uuid;
    const userName = userResult.userInfo.nickname || userResult.userInfo.name || 'User';
    const userImage = userResult.userInfo.avatar || userResult.userInfo.auth_user?.imageUrl;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    console.log('[init-channel] Request:', { hospitalId, userId });

    // 3. 병원 ID 유효성 검증 (DB 조회)
    const hospitalRows = await q<{ name: string | null; name_en: string | null }>(
      `SELECT name, name_en FROM ${TABLE_HOSPITAL} WHERE id_uuid = $1 LIMIT 1`,
      [hospitalId]
    );

    if (!hospitalRows.length) {
      return NextResponse.json(
        { ok: false, error: 'Hospital not found' },
        { status: 404 }
      );
    }

    const hospitalName = hospitalRows[0]?.name || hospitalRows[0]?.name_en || 'Hospital';

    // 4. Stream Chat 서버 클라이언트 초기화
    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('STREAM_API_KEY and STREAM_SECRET must be set');
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);

    // 5. 짧은 ID 생성
    const shortHospital = toShortId(hospitalId);
    const shortUser = toShortId(userId);
    const channelId = `h${shortHospital}_u${shortUser}`;

    console.log('[init-channel] Channel ID:', channelId);

    // 6. 고객 및 병원 유저 upsert
    await serverClient.upsertUsers([
      {
        id: userId,
        name: userName,
        image: userImage,
        user_type: 'customer',
      },
      {
        id: hospitalId,
        name: hospitalName,
        user_type: 'hospital',
      },
    ]);

    console.log('[init-channel] Users upserted');

    // 7. 채널 생성 또는 가져오기
    const channel = serverClient.channel('messaging', channelId, {
      members: [userId, hospitalId],
      created_by_id: userId,  // 상담을 시작한 사용자
      hospitalId,
      hospitalShortId: shortHospital,
      userId,
      userShortId: shortUser,
      userType: 'customer',
      hospitalName,
      userName,
    });

    // 채널이 이미 존재하면 재사용, 없으면 생성
    try {
      await channel.create();
      console.log('[init-channel] Channel created');
    } catch (error: any) {
      // 채널이 이미 존재하는 경우 (에러 코드 4: 'channel already exists')
      if (error.code === 4) {
        console.log('[init-channel] Channel already exists, reusing');
        await channel.watch();
      } else {
        throw error;
      }
    }

    // 8. 고객용 토큰 생성
    const token = serverClient.createToken(userId);

    console.log('[init-channel] Success:', { channelId, userId });

    // 9. 응답 반환
    return NextResponse.json({
      ok: true,
      token,
      apiKey,
      channelId,
    });

  } catch (error: any) {
    console.error('[init-channel] Error:', error.message);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to initialize channel',
      },
      { status: 500 }
    );
  }
}
