'use client';

import { useEffect, useState } from 'react';
import type { Channel, StreamChat } from 'stream-chat';

interface ChatListProps {
  channels: Channel[];
  client: StreamChat;
  onChannelClick: (channelId: string) => void;
}

export default function ChatList({ channels, client, onChannelClick }: ChatListProps) {
  const [channelList, setChannelList] = useState<Channel[]>(channels);

  useEffect(() => {
    setChannelList(channels);

    // Listen for new messages to update the list
    const handleEvent = () => {
      // Re-query channels to get updated list
      client
        .queryChannels(
          {
            members: { $in: [client.userID || ''] },
          },
          {
            last_message_at: -1,
          },
          {
            watch: true,
            state: true,
          }
        )
        .then((updatedChannels) => {
          setChannelList(updatedChannels);
        })
        .catch(console.error);
    };

    // Listen for new messages
    client.on('message.new', handleEvent);
    client.on('message.updated', handleEvent);

    return () => {
      client.off('message.new', handleEvent);
      client.off('message.updated', handleEvent);
    };
  }, [channels, client]);

  if (channelList.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
        <p className="text-lg">아직 문의가 없습니다</p>
        <p className="text-sm mt-2">환자가 문의를 시작하면 여기에 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
      {channelList.map((channel) => {
        const lastMessage = channel.state.messages[channel.state.messages.length - 1];
        const unreadCount = channel.countUnread();

        // Use channel.data for user information
        const channelData = channel.data as Record<string, unknown> | undefined;
        const userName = (channelData?.userName as string) || (channelData?.name as string) || '알 수 없는 사용자';
        const userId = channelData?.userId as string;

        return (
          <div
            key={channel.id}
            onClick={() => onChannelClick(channel.id || '')}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">
                    {userName}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {lastMessage && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {lastMessage.text || '(미디어 메시지)'}
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-1">
                  {lastMessage
                    ? new Date(lastMessage.created_at || '').toLocaleString('ko-KR')
                    : '메시지 없음'}
                </p>
              </div>

              <div className="ml-4">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
