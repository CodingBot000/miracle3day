"use client";

import {
  Channel as StreamChannel,
  Window,
  ChannelHeader as StreamChannelHeader,
  MessageList as StreamMessageList,
  MessageInput as StreamMessageInput,
} from 'stream-chat-react';
import { Channel } from 'stream-chat';
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
    <StreamChannel channel={channel}>
      <Window>
        <StreamChannelHeader />
        <StreamMessageList />
        <StreamMessageInput />
      </Window>
    </StreamChannel>
  );
}
