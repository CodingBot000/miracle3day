"use client";

import {
  MessageInput as StreamMessageInput,
  useChannelActionContext,
} from 'stream-chat-react';

export default function MessageInput() {
  const { sendMessage } = useChannelActionContext();

  return (
    <div className="border-t bg-white p-4">
      <StreamMessageInput
        focus
        grow
        disabled={false}
        maxRows={5}
        additionalTextareaProps={{
          placeholder: '메시지를 입력하세요...',
        }}
      />
    </div>
  );
}
