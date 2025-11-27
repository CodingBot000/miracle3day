import { NextRequest, NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';
import { getUserAPIServer } from '@/app/api/auth/getUser/getUser.server';

/**
 * Stream Chat 채널 리스트 조회 API
 * GET /api/stream/channels
 *
 * 로그인된 사용자가 참여한 모든 채널 목록을 반환
 */
export async function GET(req: NextRequest) {
  try {
    // 1. 로그인된 사용자 정보 가져오기
    const userResult = await getUserAPIServer();

    if (!userResult || !userResult.userInfo) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const userId = userResult.userInfo.id_uuid;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    // 2. Stream Chat 서버 클라이언트 초기화
    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('STREAM_API_KEY and STREAM_SECRET must be set');
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);

    // 3. 사용자가 멤버로 속한 채널 조회
    const filter = { members: { $in: [userId] } };
    const sort = [{ last_message_at: -1 as const }];
    const options = {
      limit: 30,
      state: true,
      watch: false,
    };

    const channels = await serverClient.queryChannels(filter, sort, options);

    // 4. 응답 데이터 가공
    const channelList = channels.map((channel) => {
      const channelData = (channel.data || {}) as Record<string, any>;
      const members = Object.values(channel.state?.members || {}).map((member: any) => ({
        user_id: member.user_id || member.user?.id,
        nickname: member.user?.name || 'Unknown',
        image: member.user?.image,
        user_type: member.user?.user_type,
      }));

      // 마지막 메시지 정보
      const lastMessage = channel.state?.messages?.slice(-1)[0];

      return {
        channel_url: channel.id,
        channel_id: channel.id,
        channel_cid: channel.cid,
        name: channelData.name || '',
        custom_type: channel.type,
        data: JSON.stringify({
          hospital_id_uuid: channelData.hospitalId,
          hospital_name: channelData.hospitalName,
          user_id: channelData.userId,
          user_name: channelData.userName,
        }),
        member_count: members.length,
        members,
        created_at: channelData.created_at,
        updated_at: channelData.updated_at,
        last_message_at: channelData.last_message_at,
        last_message: lastMessage ? {
          text: lastMessage.text,
          created_at: lastMessage.created_at,
          user_id: lastMessage.user?.id,
        } : null,
        // 추가 메타데이터
        hospital_id: channelData.hospitalId,
        hospital_name: channelData.hospitalName,
      };
    });

    return NextResponse.json({
      ok: true,
      channels: channelList,
      userId,
    });

  } catch (error: any) {
    console.error('[stream-channels] Error:', error.message);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to fetch channels',
      },
      { status: 500 }
    );
  }
}
