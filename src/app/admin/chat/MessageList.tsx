'use client';

import { useEffect, useState, useRef } from 'react';
import type { Channel, StreamChat, Event } from 'stream-chat';

// Define a flexible message type that works with both LocalMessage and MessageResponse
interface ChatMessage {
  id: string;
  text?: string;
  user?: { id?: string; name?: string } | null;
  created_at?: Date | string;
  attachments?: Array<{
    type?: string;
    image_url?: string;
    asset_url?: string;
    title?: string;
  }>;
}

interface MessageListProps {
  channel: Channel;
  client: StreamChat;
}

export default function MessageList({ channel, client }: MessageListProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial messages
    const loadMessages = async () => {
      try {
        const state = channel.state;
        setMessages(state.messages);
        scrollToBottom();

        // Mark channel as read when messages are loaded
        await channel.markRead();
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessages();

    // Listen for new messages
    const handleNewMessage = async (event: Event) => {
      if (event.message) {
        setMessages((prev) => [...prev, event.message as ChatMessage]);
        scrollToBottom();

        // Mark as read when new message arrives (if user is viewing this channel)
        try {
          await channel.markRead();
        } catch (err) {
          console.error('Failed to mark as read:', err);
        }
      }
    };

    const handleMessageUpdated = (event: Event) => {
      if (event.message) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === event.message?.id ? (event.message as ChatMessage) : msg
          )
        );
      }
    };

    const handleMessageDeleted = (event: Event) => {
      if (event.message) {
        setMessages((prev) => prev.filter((msg) => msg.id !== event.message?.id));
      }
    };

    channel.on('message.new', handleNewMessage);
    channel.on('message.updated', handleMessageUpdated);
    channel.on('message.deleted', handleMessageDeleted);

    return () => {
      channel.off('message.new', handleNewMessage);
      channel.off('message.updated', handleMessageUpdated);
      channel.off('message.deleted', handleMessageDeleted);
    };
  }, [channel]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const isOwnMessage = (message: ChatMessage) => {
    return message.user?.id === client.userID;
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>메시지가 없습니다</p>
          <p className="text-sm mt-2">첫 메시지를 보내보세요</p>
        </div>
      ) : (
        messages.map((message) => {
          const isOwn = isOwnMessage(message);

          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isOwn && (
                  <span className="text-xs text-gray-500 mb-1">
                    {message.user?.name || '사용자'}
                  </span>
                )}

                <div
                  className={`rounded-lg px-4 py-2 ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {/* Text message */}
                  {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}

                  {/* Image attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment, idx) => {
                        if (attachment.type === 'image' && attachment.image_url) {
                          return (
                            <img
                              key={idx}
                              src={attachment.image_url}
                              alt={attachment.title || 'image'}
                              className="rounded max-w-full h-auto"
                            />
                          );
                        }
                        if (attachment.type === 'file' && attachment.asset_url) {
                          return (
                            <a
                              key={idx}
                              href={attachment.asset_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-300 underline"
                            >
                              {attachment.title || 'Download file'}
                            </a>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>

                <span className="text-xs text-gray-400 mt-1">
                  {formatTime(message.created_at)}
                </span>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
