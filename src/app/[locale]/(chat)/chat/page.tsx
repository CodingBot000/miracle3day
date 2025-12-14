"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Chat } from 'stream-chat-react';
import { StreamChat, Channel } from 'stream-chat';
import ChatRoom from './ChatRoom';
import 'stream-chat-react/dist/css/v2/index.css';
import './chat.css';

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
      setError('Channel ID not found.');
      setLoading(false);
      return;
    }

    const initChat = async () => {
      try {
        // 1. Call token API
        const response = await fetch('/api/stream/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to issue token');
        }

        const { token, apiKey, userId } = await response.json();

        // 2. Initialize Stream client
        const streamClient = StreamChat.getInstance(apiKey);

        // 3. Connect user
        await streamClient.connectUser(
          {
            id: userId,
          },
          token
        );

        // 4. Get channel (using short channelId)
        // channelId format: h{shortHospital}_u{shortUser}
        // Actual data stored in channel.data
        const streamChannel = streamClient.channel('messaging', channelId);
        await streamChannel.watch();

        setClient(streamClient);
        setChannel(streamChannel);
        setLoading(false);
      } catch (err: any) {
        console.error('[ChatPage] Error:', err);
        setError(err.message || 'Failed to load chat room');
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
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading chat room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chat Room Loading Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!client || !channel) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Unable to initialize chat client.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <Chat client={client} theme="str-chat__theme-light">
        <ChatRoom channel={channel} />
      </Chat>
    </div>
  );
}
