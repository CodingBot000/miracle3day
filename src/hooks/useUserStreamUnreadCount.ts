'use client';

import { useEffect, useState, useRef } from 'react';
import { StreamChat, Channel, Event } from 'stream-chat';
import { getStreamClient } from '@/lib/stream/client';

/**
 * User-facing Stream Chat unread message count hook
 * - Event-based real-time updates (no polling)
 * - Returns total count + per-channel map for chat list page
 * - Uses tokenProvider for automatic token refresh
 *
 * @returns totalUnreadCount - Total unread messages across all channels
 * @returns unreadChannelCount - Number of channels with unread messages
 * @returns channelsWithUnread - Map of channelId -> unread count
 * @returns isLoading - Loading state
 */
export function useUserStreamUnreadCount() {
  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);
  const [unreadChannelCount, setUnreadChannelCount] = useState<number>(0);
  const [channelsWithUnread, setChannelsWithUnread] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const clientRef = useRef<StreamChat | null>(null);
  const channelsRef = useRef<Channel[]>([]);
  const userIdRef = useRef<string>('');

  useEffect(() => {
    let mounted = true;

    const updateUnreadCounts = (channels: Channel[]) => {
      if (!mounted) return;

      let totalUnread = 0;
      let unreadChans = 0;
      const channelMap = new Map<string, number>();

      channels.forEach((channel) => {
        const unread = channel.countUnread();
        totalUnread += unread;
        if (unread > 0) {
          unreadChans += 1;
        }
        // Store per-channel count (use channel.id as key)
        channelMap.set(channel.id!, unread);
      });

      setTotalUnreadCount(totalUnread);
      setUnreadChannelCount(unreadChans);
      setChannelsWithUnread(channelMap);
    };

    const handleNewMessage = (event: Event) => {
      // Only update if message is not from current user
      if (event.user?.id !== userIdRef.current) {
        updateUnreadCounts(channelsRef.current);
      }
    };

    const handleMessageRead = () => {
      updateUnreadCounts(channelsRef.current);
    };

    const initStream = async () => {
      try {
        // 1. Get user token from API (POST method for user token)
        const response = await fetch('/api/stream/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          console.error('[useUserStreamUnreadCount] Failed to get token');
          setIsLoading(false);
          return;
        }

        const { apiKey, userId, token } = await response.json();
        userIdRef.current = userId;

        // 2. Initialize Stream client (singleton)
        const client = getStreamClient(apiKey);
        clientRef.current = client;

        // 3. Check if already connected
        if (client.userID && client.userID === userId) {
          // Already connected, just query channels
          console.log('[useUserStreamUnreadCount] Already connected, querying channels...');
        } else {
          // Connect user with tokenProvider for auto token refresh
          await client.connectUser(
            {
              id: userId,
            } as { id: string },
            async () => {
              // Token refresh callback (called automatically when token expires)
              const res = await fetch('/api/stream/token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                cache: 'no-store'
              });
              const data = await res.json();
              return data.token;
            }
          );
        }

        if (!mounted) return;

        // 4. Query user's channels (watch: true for real-time monitoring)
        const channels = await client.queryChannels(
          {
            members: { $in: [userId] },
          },
          {
            last_message_at: -1,
          },
          {
            watch: true,  // Real-time channel monitoring
            state: true,
          }
        );

        if (!mounted) return;

        channelsRef.current = channels;

        // 5. Calculate initial unread counts
        updateUnreadCounts(channels);

        console.log('[useUserStreamUnreadCount] Initialized with event-based updates');

        // 6. Register event listeners
        client.on('message.new', handleNewMessage);
        client.on('message.read', handleMessageRead);
        client.on('notification.message_new', handleNewMessage);

        setIsLoading(false);
      } catch (error) {
        console.error('[useUserStreamUnreadCount] Failed to initialize:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initStream();

    // Cleanup
    return () => {
      mounted = false;

      if (clientRef.current) {
        clientRef.current.off('message.new', handleNewMessage);
        clientRef.current.off('message.read', handleMessageRead);
        clientRef.current.off('notification.message_new', handleNewMessage);
        // Note: Don't disconnect client here - singleton is maintained
        // across navigation. Disconnect will be handled on logout.
      }
    };
  }, []);

  return {
    totalUnreadCount,
    unreadChannelCount,
    channelsWithUnread,
    isLoading,
  };
}
