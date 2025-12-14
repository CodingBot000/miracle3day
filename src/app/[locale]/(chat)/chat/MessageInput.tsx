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
          placeholder: 'Enter a message...',
        }}
      />
    </div>
  );
}
