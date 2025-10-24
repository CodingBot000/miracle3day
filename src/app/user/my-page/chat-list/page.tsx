"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MessageCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import LottieLoading from "@/components/atoms/LottieLoading";

interface ChannelData {
  channel_url: string;
  name: string;
  custom_type: string;
  data: string;
  member_count: number;
  members: Array<{ user_id: string; nickname: string }>;
}

export default function ChatListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        // 1. 사용자 인증 확인
        const authRes = await fetch("/api/auth/getUser/session");
        const authData = await authRes.json();
        const userInfo = authData?.userInfo;

        if (!userInfo?.auth_user) {
          router.push("/auth/login?redirect=/user/my-page/chat-list");
          return;
        }

        const memberUuid =
          userInfo.uuid ??
          userInfo.id_uuid ??
          userInfo.auth_user.id;

        setUserId(memberUuid);

        // 2. 채널 리스트 가져오기
        const channelRes = await fetch(`/api/chat/channels?userId=${memberUuid}`);
        const channelData = await channelRes.json();

        if (channelData.ok) {
          setChannels(channelData.channels);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("[ChatListPage] Error:", error);
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [router]);

  const handleOpenChat = (channelUrl: string) => {
    router.push(`/chat/${encodeURIComponent(channelUrl)}`);
  };

  const getHospitalIdFromChannel = (channel: ChannelData): string | null => {
    try {
      const meta = JSON.parse(channel.data);
      return meta.hospital_id_uuid || null;
    } catch {
      return null;
    }
  };

  const getHospitalNameFromChannel = (channel: ChannelData): string => {
    // 채널 이름이 member nickname으로 설정되어 있으므로,
    // 상대방(병원)의 nickname을 찾아야 합니다
    const otherMember = channel.members.find(m => m.user_id !== userId);
    return otherMember?.nickname || channel.name || "Unknown Hospital";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LottieLoading size={200} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center border-b sticky top-0 z-10">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold ml-2">My Chatting List</h1>
        </div>

        {/* Channel List */}
        <div className="p-4">
          {channels.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No chat history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {channels.map((channel) => {
                const hospitalId = getHospitalIdFromChannel(channel);
                const hospitalName = getHospitalNameFromChannel(channel);

                return (
                  <div
                    key={channel.channel_url}
                    className="bg-white rounded-lg p-4 shadow-sm border"
                  >
                    <h3 className="font-semibold text-lg mb-3">
                      {hospitalName}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenChat(channel.channel_url)}
                        style={{ backgroundColor: '#9333ea' }}
                        className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Open Chat
                      </button>
                      {hospitalId && (
                        <Link
                          href={`/hospital/${hospitalId}`}
                          className="px-4 py-2 bg-green-100 text-white rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Go to Hospital
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
