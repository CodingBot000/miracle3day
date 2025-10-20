"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/session/client";
import { useRouter } from "next/navigation";
import ChatClient from "@/components/ChatClient";
import LottieLoading from "@/components/atoms/LottieLoading";
import { ChevronLeft } from "lucide-react";

const APP_ID = process.env.NEXT_PUBLIC_SBBB_APP_ID || "7FE17A5E-B2D3-436D-813F-FC68A60F23BD";

export default function ChatChannelPage({ params }: { params: { channelUrl: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();
  const backendClient = createClient();
  const channelUrl = decodeURIComponent(params.channelUrl);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[ChatChannelPage] Checking auth...');
        const res = await fetch("/api/auth/getUser/session");
        const data = await res.json();
        console.log('[ChatChannelPage] User data:', data);

        if (!data.user) {
          console.log('[ChatChannelPage] No user, redirecting to login');
          router.push(`/auth/login?redirect=/chat/${encodeURIComponent(channelUrl)}`);
          return;
        }

        console.log('[ChatChannelPage] User logged in, user ID:', data.user.id);
        // members.uuid를 userId로 사용
        setUserId(data.user.id);
        setIsLoading(false);
      } catch (err) {
        console.error('[ChatChannelPage] Error checking auth:', err);
        router.push(`/auth/login?redirect=/chat/${encodeURIComponent(channelUrl)}`);
      }
    };

    checkAuth();
  }, [router, channelUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LottieLoading size={200} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Chatting</h1>
        </div>
        <ChatClient appId={APP_ID} userId={userId} channelUrl={channelUrl} />
      </div>
    </main>
  );
}
