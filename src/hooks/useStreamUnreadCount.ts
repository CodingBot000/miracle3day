'use client';

import { useEffect, useState, useRef } from 'react';
import { StreamChat, Channel, Event } from 'stream-chat';
import { getStreamClient } from '@/lib/stream/adminClient';

/**
 * Stream Chat 미확인 메시지 수를 가져오는 훅
 * - 10초 폴링 제거, 이벤트 기반 실시간 업데이트
 * - tokenProvider 사용으로 토큰 자동 갱신
 *
 * @returns totalUnreadCount - 전체 미확인 메시지 수
 * @returns unreadChannelCount - 미확인 메시지가 있는 채널 수
 * @returns isLoading - 로딩 상태
 */
export function useStreamUnreadCount() {
  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);
  const [unreadChannelCount, setUnreadChannelCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const clientRef = useRef<StreamChat | null>(null);
  const channelsRef = useRef<Channel[]>([]);
  const hospitalIdRef = useRef<string>('');

  useEffect(() => {
    let mounted = true;

    const updateUnreadCounts = (channels: Channel[]) => {
      if (!mounted) return;

      let totalUnread = 0;
      let unreadChans = 0;

      channels.forEach((channel) => {
        const unread = channel.countUnread();
        totalUnread += unread;
        if (unread > 0) {
          unreadChans += 1;
        }
      });

      setTotalUnreadCount(totalUnread);
      setUnreadChannelCount(unreadChans);
    };

    const handleNewMessage = (event: Event) => {
      // 내가 보낸 메시지가 아닐 때만 unread count 증가
      if (event.user?.id !== hospitalIdRef.current) {
        updateUnreadCounts(channelsRef.current);
      }
    };

    const handleMessageRead = () => {
      updateUnreadCounts(channelsRef.current);
    };

    const initStream = async () => {
      try {
        // 1. 토큰 API 호출 (초기 1회)
        const response = await fetch('/api/admin/stream/token', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          console.error('[useStreamUnreadCount] Failed to get token');
          setIsLoading(false);
          return;
        }

        const { apiKey, hospitalId, hospitalName } = await response.json();
        hospitalIdRef.current = hospitalId;

        // 2. Stream 클라이언트 초기화 (싱글톤)
        const client = getStreamClient(apiKey);
        clientRef.current = client;

        // 3. 이미 연결되어 있는지 확인
        if (client.userID && client.userID === hospitalId) {
          // 이미 연결된 경우 채널만 쿼리
          console.log('[useStreamUnreadCount] Already connected, querying channels...');
        } else {
          // tokenProvider로 연결 (토큰 만료 시 자동 갱신)
          await client.connectUser(
            {
              id: hospitalId,
              name: hospitalName,
            } as { id: string; name: string },
            async () => {
              // 토큰 갱신 콜백 (토큰 만료 시 자동 호출됨)
              const res = await fetch('/api/admin/stream/token', {
                method: 'GET',
                cache: 'no-store'
              });
              const data = await res.json();
              return data.token;
            }
          );
        }

        if (!mounted) return;

        // 4. 채널 쿼리 (watch: true로 실시간 감시)
        const channels = await client.queryChannels(
          {
            members: { $in: [hospitalId] },
          },
          {
            last_message_at: -1,
          },
          {
            watch: true,  // 채널 변화 실시간 감시
            state: true,
          }
        );

        if (!mounted) return;

        channelsRef.current = channels;

        // 5. 초기 unread count 계산
        updateUnreadCounts(channels);

        console.log('[useStreamUnreadCount] Initialized with event-based updates');

        // 6. 이벤트 리스너 등록
        client.on('message.new', handleNewMessage);
        client.on('message.read', handleMessageRead);
        client.on('notification.message_new', handleNewMessage);

        setIsLoading(false);
      } catch (error) {
        console.error('[useStreamUnreadCount] Failed to initialize:', error);
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
        // Note: disconnectUser는 채팅 페이지에서도 사용할 수 있으므로
        // 여기서는 호출하지 않음 (싱글톤 유지)
      }
    };
  }, []);

  return {
    totalUnreadCount,
    unreadChannelCount,
    isLoading,
  };
}
