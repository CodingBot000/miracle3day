"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Consultation Test Page
 * Quick access page to test video consultation feature
 */
export default function ConsultTestPage() {
  const router = useRouter();
  const [reservationId, setReservationId] = useState("test-12345");
  const [role, setRole] = useState<"doctor" | "patient">("patient");
  const [name, setName] = useState("");

  const handleJoinRoom = () => {
    const query = new URLSearchParams();
    query.set("role", role);
    if (name) query.set("name", name);

    router.push(`/mobile/consult/${reservationId}?${query.toString()}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Video Consultation Test
          </h1>

          <div className="space-y-4">
            {/* Reservation ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reservation ID
              </label>
              <input
                type="text"
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
                placeholder="Enter reservation ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Same ID = Same room (e.g., test-12345)
              </p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Role
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="patient"
                    checked={role === "patient"}
                    onChange={(e) => setRole(e.target.value as "patient")}
                    className="mr-2"
                  />
                  <span>Patient</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="doctor"
                    checked={role === "doctor"}
                    onChange={(e) => setRole(e.target.value as "doctor")}
                    className="mr-2"
                  />
                  <span>Doctor</span>
                </label>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to use default name
              </p>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinRoom}
              disabled={!reservationId}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Join Consultation Room
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              How to Test:
            </h3>
            <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
              <li>Open this page in two different browsers</li>
              <li>Use the same Reservation ID in both</li>
              <li>Select different roles (one doctor, one patient)</li>
              <li>Click "Join Consultation Room" in both</li>
              <li>Allow camera/microphone permissions</li>
              <li>Start video consultation!</li>
            </ol>
          </div>

          {/* Quick Links */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Quick Links:
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setReservationId("test-12345");
                  setRole("patient");
                  setName("Alice");
                }}
                className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Patient: Alice (Room: test-12345)
              </button>
              <button
                onClick={() => {
                  setReservationId("test-12345");
                  setRole("doctor");
                  setName("Dr. Smith");
                }}
                className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Doctor: Dr. Smith (Room: test-12345)
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
