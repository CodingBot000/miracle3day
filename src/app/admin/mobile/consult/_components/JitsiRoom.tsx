"use client";
import React from "react";
import { FiVideo, FiExternalLink, FiAlertCircle } from "react-icons/fi";

/**
 * Jitsi Room Component (New Window Mode)
 *
 * NOTE: meet.jit.si public instance blocks iframe embedding due to X-Frame-Options: SAMEORIGIN
 * and CORS restrictions. This component opens Jitsi in a new window instead.
 *
 * For production with embedded video:
 * - Use Jitsi as a Service (JaaS) with your own domain
 * - Self-host Jitsi server
 * - Use alternative services like Daily.co or LiveKit
 *
 * @param roomName - Unique room identifier (e.g., "beautylink-<reservationId>")
 * @param displayName - User's display name in the meeting
 * @param subject - Meeting title/subject
 */
type JitsiRoomProps = {
  roomName: string;
  displayName: string;
  subject?: string;
};

export default function JitsiRoom({ roomName, displayName, subject }: JitsiRoomProps) {
  const handleOpenJitsi = () => {
    const url = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(displayName)}"`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full rounded-lg border-2 border-gray-300 bg-white shadow-lg p-6 md:p-8">
      {/* Warning Message */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
        <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-yellow-900 mb-1">
            Embedded video unavailable
          </p>
          <p className="text-yellow-700">
            Due to meet.jit.si security restrictions (X-Frame-Options: SAMEORIGIN),
            we cannot embed the video directly on this page. Please click the button below
            to open the consultation in a new window.
          </p>
        </div>
      </div>

      {/* Room Info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Video Consultation Room
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium min-w-[80px]">Room:</span>
            <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
              {roomName}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium min-w-[80px]">Your Name:</span>
            <span>{displayName}</span>
          </div>
          {subject && (
            <div className="flex items-center gap-2">
              <span className="font-medium min-w-[80px]">Subject:</span>
              <span>{subject}</span>
            </div>
          )}
        </div>
      </div>

      {/* Open Button */}
      <button
        type="button"
        onClick={handleOpenJitsi}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        <FiVideo className="w-5 h-5" />
        <span>Open Jitsi Room in New Window</span>
        <FiExternalLink className="w-4 h-4" />
      </button>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Instructions:
        </h4>
        <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
          <li>Click the button above to open Jitsi in a new window</li>
          <li>Allow camera and microphone permissions when prompted</li>
          <li>Your name ({displayName}) will be set automatically</li>
          <li>Wait for other participants to join the same room</li>
          <li>Use the Hangup button in Jitsi to end the call</li>
        </ol>
      </div>

      {/* Technical Note */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
        <p className="text-xs text-gray-500">
          <strong>Note for developers:</strong> For production deployment with embedded video,
          consider using Jitsi as a Service (JaaS), self-hosting Jitsi, or alternative services
          like Daily.co or LiveKit. The current implementation uses meet.jit.si public instance
          which blocks iframe embedding.
        </p>
      </div>
    </div>
  );
}
