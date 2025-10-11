"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LottieLoading from "@/components/atoms/LottieLoading";

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[ChatPage] Checking auth...');
        const res = await fetch("/api/auth/getUser/session");
        const data = await res.json();
        console.log('[ChatPage] User data:', data);

        if (!data.user) {
          console.log('[ChatPage] No user, redirecting to login');
          router.push("/auth/login?redirect=/chat");
          return;
        }

        console.log('[ChatPage] User logged in, showing chat page');
        setUser(data.user);
        setIsLoading(false);
      } catch (err) {
        console.error('[ChatPage] Error checking auth:', err);
        setError("Unable to verify user information. Please try again.");
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LottieLoading size={200} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">채팅</h1>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                채팅 기능을 사용하려면 병원 상세 페이지에서 상담 요청을 먼저 보내주세요.
              </p>
              <p className="text-sm text-gray-600">
                환영합니다, {user?.email}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">채팅 목록</h2>
              <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                아직 진행 중인 채팅이 없습니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
