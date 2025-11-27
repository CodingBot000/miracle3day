import { NextRequest, NextResponse } from 'next/server';
import { getUserAPIServer } from '@/app/api/auth/getUser/getUser.server';
import { createUserToken, upsertStreamUser } from '@/lib/stream/token';

/**
 * Stream Chat 사용자 토큰 발급 API
 * POST /api/stream/token
 *
 * 로그인된 사용자의 id_uuid를 기반으로 Stream Chat 토큰 생성
 * 동시에 Stream 서버에 사용자 정보 upsert
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 서버 세션에서 사용자 정보 가져오기
    const userResult = await getUserAPIServer();

    if (!userResult || !userResult.userInfo) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const userId = userResult.userInfo.id_uuid;
    const userName = userResult.userInfo.nickname || userResult.userInfo.name || 'User';
    const userImage: string | undefined = 
      (userResult.userInfo.avatar as string | undefined) || 
      (userResult.userInfo.auth_user?.imageUrl as string | undefined);

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    log.debug('[stream-token] Creating token for user:', userId);

    // 2. Stream 사용자 정보 upsert
    await upsertStreamUser(userId, {
      name: userName,
      image: userImage,
      role: 'user',
      user_type: 'customer',
    });

    // 3. 토큰 생성
    const token = await createUserToken(userId);

    // 4. API Key 반환 (프론트에서 클라이언트 초기화에 필요)
    const apiKey = process.env.STREAM_API_KEY;

    if (!apiKey) {
      throw new Error('STREAM_API_KEY not configured');
    }

    log.debug('[stream-token] Token created successfully for:', userId);

    return NextResponse.json({
      ok: true,
      token,
      apiKey,
      userId,
    });

  } catch (error: any) {
    console.error('[stream-token] Error:', error.message);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to create token',
      },
      { status: 500 }
    );
  }
}
