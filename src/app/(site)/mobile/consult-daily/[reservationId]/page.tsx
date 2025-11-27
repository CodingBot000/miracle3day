"use client";

import { log } from '@/utils/logger';


import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import DailyFrame from "@/app/(site)/mobile/consult-daily/_components/DailyFrame";

export default function DailyConsultPage() {
  const router = useRouter();
  const { reservationId } = useParams<{ reservationId: string }>();
  const searchParams = useSearchParams();

  const role = searchParams.get("role") ?? "patient"; // doctor | patient
  const userName = searchParams.get("name") ?? (role === "doctor" ? "Doctor" : "Guest");

  const [dailyUrl, setDailyUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeRoom() {
      try {
        setIsLoading(true);
        setError(null);

        const roomName = `bl-${reservationId}`;

        log.debug("[Daily] Initializing room:", { roomName, userName, role });

        // 1) Create or get existing room
        const roomRes = await fetch("/mobile/consult-daily/api/create-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reservationId }),
        });

        const roomData = await roomRes.json();
        log.debug("[Daily] Room response:", roomData);

        if (!roomRes.ok) {
          // Show detailed error from Daily API
          const errorMsg = roomData.info
            ? `${roomData.error}: ${roomData.info}`
            : (roomData.error || "Failed to create room");
          throw new Error(errorMsg);
        }

        log.debug("[Daily] Room ready:", roomData);

        // 2) Create meeting token with role-based permissions
        const tokenRes = await fetch("/mobile/consult-daily/api/create-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName,
            userName,
            role,
          }),
        });

        const tokenData = await tokenRes.json();
        log.debug("[Daily] Token response:", tokenData);

        if (!tokenRes.ok) {
          // Show detailed error from Daily API
          const errorMsg = tokenData.info
            ? `${tokenData.error}: ${tokenData.info}`
            : (tokenData.error || "Failed to create token");
          throw new Error(errorMsg);
        }

        if (!tokenData.token) {
          throw new Error("No token received from Daily API");
        }

        log.debug("[Daily] Token created successfully");

        // 3) Construct iframe URL with token
        const dailyDomain = process.env.NEXT_PUBLIC_DAILY_DOMAIN || "your-subdomain";
        const url = `https://${dailyDomain}/${roomName}?t=${tokenData.token}`;

        log.debug("[Daily] Opening URL:", url);
        setDailyUrl(url);
      } catch (err) {
        console.error("[Daily] Initialization error:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize consultation room");
      } finally {
        setIsLoading(false);
      }
    }

    initializeRoom();
  }, [reservationId, role, userName]);

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Preparing consultation room...</p>
          <p className="text-sm text-gray-500 mt-2">Setting up video connection</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 border border-red-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">
              Video Consultation (Daily.co)
            </h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span>Reservation: <strong>{reservationId}</strong></span>
              <span>|</span>
              <span>Role: <strong className={role === "doctor" ? "text-blue-600" : "text-green-600"}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </strong></span>
              <span>|</span>
              <span>Name: <strong>{userName}</strong></span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Video Frame */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <DailyFrame url={dailyUrl} />
      </div>

      {/* Info Footer */}
      <div className="max-w-6xl mx-auto px-4 pb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            <strong>✓ Production-ready:</strong> This consultation uses Daily.co Prebuilt,
            which supports iframe embedding, screen sharing, recording, and chat.
            {role === "doctor" && " As a doctor, you have moderator privileges and can control recording."}
          </p>
        </div>
      </div>
    </main>
  );
}
