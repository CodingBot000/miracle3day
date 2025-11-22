"use client";

import { Channel as StreamChannel } from 'stream-chat-react';
import { Channel } from 'stream-chat';
import ChannelHeader from './ChannelHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import 'stream-chat-react/dist/css/v2/index.css';

interface ChatRoomProps {
  channel: Channel | null;
}

export default function ChatRoom({ channel }: ChatRoomProps) {
  if (!channel) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">채팅방을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <StreamChannel channel={channel}>
        <ChannelHeader channel={channel} />
        <MessageList />
        <MessageInput />
      </StreamChannel>
    </div>
  );
}
