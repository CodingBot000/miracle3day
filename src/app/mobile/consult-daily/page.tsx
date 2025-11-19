"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiVideo, FiUser, FiHash } from "react-icons/fi";

/**
 * Daily.co Video Consultation Test Page
 *
 * Quick testing interface for Daily Prebuilt video consultation
 * Supports both doctor and patient roles with separate room access
 */
export default function DailyTestPage() {
  const router = useRouter();

  const [reservationId, setReservationId] = useState("test123");
  const [role, setRole] = useState<"doctor" | "patient">("patient");
  const [userName, setUserName] = useState("");

  const handleJoinRoom = () => {
    const name = userName || (role === "doctor" ? "Dr.Smith" : "Alice");
    const params = new URLSearchParams({
      role,
      name,
    });

    router.push(`/mobile/consult-daily/${reservationId}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <FiVideo className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Daily.co Video Consultation
          </h1>
          <p className="text-gray-600">
            Production-ready video consultation with iframe embedding
          </p>
        </div>

        {/* Test Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Quick Test Setup
          </h2>

          <div className="space-y-6">
            {/* Reservation ID */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FiHash className="w-4 h-4" />
                Reservation ID
              </label>
              <input
                type="text"
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
                placeholder="e.g., test123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use the same ID for doctor and patient to join the same room
              </p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    role === "patient"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="text-2xl mb-2">👤</div>
                  <div className="font-semibold">Patient</div>
                  <div className="text-xs mt-1 opacity-75">Standard participant</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("doctor")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    role === "doctor"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="text-2xl mb-2">👨‍⚕️</div>
                  <div className="font-semibold">Doctor</div>
                  <div className="text-xs mt-1 opacity-75">Moderator privileges</div>
                </button>
              </div>
            </div>

            {/* User Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FiUser className="w-4 h-4" />
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={role === "doctor" ? "Dr.Smith" : "Alice"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to use default name
              </p>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinRoom}
              disabled={!reservationId}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
            >
              <FiVideo className="w-5 h-5" />
              Join Consultation Room
            </button>
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">
            ✨ Daily.co Features
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>iframe Embedding:</strong> Works seamlessly without popup blockers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Screen Sharing:</strong> Share your screen during consultations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Cloud Recording:</strong> Doctor can record sessions (with permissions)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Chat Support:</strong> Text chat alongside video</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Role-based Permissions:</strong> Doctors get moderator privileges</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Background Blur:</strong> Professional appearance</span>
            </li>
          </ul>
        </div>

        {/* Testing Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-3">
            📝 Testing Instructions
          </h3>
          <ol className="space-y-2 text-sm text-yellow-800 list-decimal list-inside">
            <li>Open this page in two different browsers (or incognito window)</li>
            <li>Browser A: Select "Patient" role and use reservation ID "test123"</li>
            <li>Browser B: Select "Doctor" role and use the same ID "test123"</li>
            <li>Both click "Join Consultation Room"</li>
            <li>Allow camera/microphone permissions when prompted</li>
            <li>You should see each other in the video call! 🎉</li>
          </ol>
        </div>

        {/* Environment Note */}
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> Make sure <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              DAILY_API_KEY
            </code> and <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              NEXT_PUBLIC_DAILY_DOMAIN
            </code> are set in your <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              .env.local
            </code> file.
          </p>
        </div>
      </div>
    </main>
  );
}
