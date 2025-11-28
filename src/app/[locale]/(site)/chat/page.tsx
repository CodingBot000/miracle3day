"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Chat } from 'stream-chat-react';
import { StreamChat, Channel } from 'stream-chat';
import ChatRoom from './ChatRoom';
import 'stream-chat-react/dist/css/v2/index.css';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const channelId = searchParams.get('cid');

    if (!channelId) {
      setError('채널 ID가 없습니다.');
      setLoading(false);
      return;
    }

    const initChat = async () => {
      try {
        // 1. 토큰 발급 API 호출
        const response = await fetch('/api/stream/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '토큰 발급 실패');
        }

        const { token, apiKey, userId } = await response.json();

        // 2. Stream client 초기화
        const streamClient = StreamChat.getInstance(apiKey);

        // 3. 사용자 연결
        await streamClient.connectUser(
          {
            id: userId,
          },
          token
        );

        // 4. 채널 가져오기 (짧은 channelId 사용)
        // channelId는 h{shortHospital}_u{shortUser} 형식
        // 실제 데이터는 channel.data에 저장됨
        const streamChannel = streamClient.channel('messaging', channelId);
        await streamChannel.watch();

        setClient(streamClient);
        setChannel(streamChannel);
        setLoading(false);
      } catch (err: any) {
        console.error('[ChatPage] Error:', err);
        setError(err.message || '채팅방 로딩 실패');
        setLoading(false);
      }
    };

    initChat();

    // Cleanup
    return () => {
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [searchParams]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">채팅방을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            채팅방 로딩 오류
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!client || !channel) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">채팅 클라이언트를 초기화할 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      <Chat client={client} theme="str-chat__theme-light">
        <ChatRoom channel={channel} />
      </Chat>
    </div>
  );
}
