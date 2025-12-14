"use client";

import {
  MessageList as StreamMessageList,
  MessageSimple,
} from 'stream-chat-react';

export default function MessageList() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <StreamMessageList
        Message={MessageSimple}
        disableDateSeparator={false}
        messageActions={['edit', 'delete', 'reply']}
        hideDeletedMessages={false}
        closeReactionSelectorOnClick={true}
      />
    </div>
  );
}
