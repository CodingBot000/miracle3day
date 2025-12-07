'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStreamClient } from '@/lib/stream/adminClient';
import ChatList from './ChatList';
import ChannelHeader from './ChannelHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import type { StreamChat } from 'stream-chat';
import type { Channel } from 'stream-chat';

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cid = searchParams.get('cid');

  const [client, setClient] = useState<StreamChat | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let streamClient: StreamChat | null = null;

    const initStream = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Get Stream token from API
        const response = await fetch('/api/admin/stream/token', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to get token');
        }

        const { token, apiKey, hospitalId, hospitalName } = await response.json();

        // 2. Initialize Stream client
        streamClient = getStreamClient(apiKey);

        // 3. Connect user
        await streamClient.connectUser(
          {
            id: hospitalId,
            name: hospitalName,
            user_type: 'hospital',
          } as Parameters<typeof streamClient.connectUser>[0],
          token
        );

        console.log('[ChatPage] ✅ Stream connected:', hospitalId);

        if (!mounted) return;

        setClient(streamClient);

        // 4. Query channels where hospital is a member
        const channelList = await streamClient.queryChannels(
          {
            members: { $in: [hospitalId] },
          },
          {
            last_message_at: -1, // Sort by most recent message
          },
          {
            watch: true, // Real-time updates
            state: true,
          }
        );

        console.log('[ChatPage] ✅ Channels loaded:', channelList.length);

        if (!mounted) return;

        setChannels(channelList);
      } catch (err) {
        console.error('[ChatPage] ❌ Error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize chat');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initStream();

    return () => {
      mounted = false;
      if (streamClient) {
        streamClient.disconnectUser().catch(console.error);
      }
    };
  }, []);

  // Handle active channel based on cid query param
  useEffect(() => {
    if (!client || !cid) {
      setActiveChannel(null);
      return;
    }

    let mounted = true;

    async function initChannel() {
      try {
        // First, try to find channel in existing channels list
        const fromList = channels.find((ch) => ch.id === cid);
        if (fromList) {
          if (mounted) {
            setActiveChannel(fromList);
          }
          return;
        }

        // If not found, fetch channel directly
        if (!client) return;
        const channel = client.channel('messaging', cid);
        await channel.watch();

        if (mounted) {
          setActiveChannel(channel);
        }
      } catch (err) {
        console.error('[ChatPage] Failed to load channel:', err);
        if (mounted) {
          setActiveChannel(null);
        }
      }
    }

    initChannel();

    return () => {
      mounted = false;
    };
  }, [client, cid, channels]);

  const handleBackToAdmin = () => {
    router.push('/admin');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">연결 오류</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={handleBackToAdmin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            관리자 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">채팅 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <div className="bg-white shadow-md p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">환자 문의 채팅</h1>
          <button
            onClick={handleBackToAdmin}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            돌아가기
          </button>
        </div>
        <p className="text-gray-600 mt-2">총 {channels.length}개의 채팅방</p>
      </div>

      {/* Split Screen Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Channel List */}
        <div className="w-[400px] border-r border-gray-200 overflow-y-auto">
          <ChatList
            channels={channels}
            client={client}
            onChannelClick={(channelId) => {
              router.push(`/admin/chat?cid=${encodeURIComponent(channelId)}`);
            }}
          />
        </div>

        {/* Right: Chat Room */}
        <div className="flex-1 flex flex-col bg-white">
          {activeChannel ? (
            <>
              <ChannelHeader
                channel={activeChannel}
                onBack={() => router.push('/admin/chat')}
              />
              <div className="flex-1 overflow-hidden flex flex-col">
                <MessageList channel={activeChannel} client={client} />
                <MessageInput channel={activeChannel} />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-lg">채팅방을 선택해주세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">채팅 목록을 불러오는 중...</p>
          </div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
