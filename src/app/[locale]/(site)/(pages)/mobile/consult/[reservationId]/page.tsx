"use client";
import React, { useEffect, useState } from "react";
import JitsiRoom from "@/app/[locale]/(site)/(pages)/mobile/consult/_components/JitsiRoom";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";

export default function ConsultPage() {
  const router = useRouter();
  const { reservationId } = useParams<{ reservationId: string }>();
  const searchParams = useSearchParams();
  const user = useUserStore((state) => state.userInfo);

  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"doctor" | "patient" | "guest">("guest");

  useEffect(() => {
    // Get role and name from URL params or user data
    const roleParam = searchParams.get("role") as "doctor" | "patient" | null;
    const nameParam = searchParams.get("name");

    if (roleParam) {
      setRole(roleParam);
    }

    // Set display name from params or user data
    if (nameParam) {
      setDisplayName(nameParam);
    } else if (user?.name) {
      setDisplayName(user.name);
    } else if (user?.email) {
      setDisplayName(user.email.split("@")[0]);
    } else {
      setDisplayName(roleParam === "doctor" ? "Doctor" : "Guest");
    }

    setIsLoading(false);
  }, [searchParams, user]);

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing consultation room...</p>
        </div>
      </main>
    );
  }

  // Generate room name based on reservation ID
  const roomName = `beautylink-${reservationId}`;

  // Optional: Generate password (disabled for testing phase)
  const password = undefined; // Can be enabled: `BL-${reservationId}-pass`

  return (
    <main className="px-2 py-2 md:px-4 md:py-4 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">
            Video Consultation (Jitsi Test)
          </h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">Reservation:</span>
            <p className="text-gray-900 mt-1">{reservationId}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Role:</span>
            <p className="mt-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  role === "doctor"
                    ? "bg-blue-100 text-blue-800"
                    : role === "patient"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Display Name:</span>
            <p className="text-gray-900 mt-1">{displayName}</p>
          </div>
        </div>
      </div>

      {/* Jitsi Video Room */}
      <JitsiRoom
        roomName={roomName}
        displayName={displayName}
        subject={`BeautyLink Consultation - ${reservationId}`}
      />

      {/* Important Note */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> Currently using meet.jit.si public instance which blocks iframe embedding
          due to X-Frame-Options (SAMEORIGIN) security policy. The video consultation will open in a new window.
          For production deployment with embedded video, we will use Jitsi as a Service (JaaS), self-hosted Jitsi,
          or alternative services like Daily.co or LiveKit.
        </p>
      </div>
    </main>
  );
}
