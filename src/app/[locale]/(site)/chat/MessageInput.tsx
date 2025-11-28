"use client";

import {
  MessageInput as StreamMessageInput,
} from 'stream-chat-react';

export default function MessageInput() {
  return (
    <div className="border-t bg-white p-4">
      <StreamMessageInput
        focus
        maxRows={5}
        additionalTextareaProps={{
          placeholder: '메시지를 입력하세요...',
        }}
      />
    </div>
  );
}
