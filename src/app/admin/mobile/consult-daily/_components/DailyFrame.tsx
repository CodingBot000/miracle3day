"use client";

import React, { forwardRef } from "react";

type DailyFrameProps = {
  url: string;
};

/**
 * Daily Prebuilt Video Frame Component
 * Embeds Daily.co video consultation room via iframe
 *
 * Unlike Jitsi's meet.jit.si which blocks iframe embedding,
 * Daily.co Prebuilt supports iframe embedding with full features
 */
const DailyFrame = forwardRef<HTMLIFrameElement, DailyFrameProps>(
  ({ url }, ref) => {
    if (!url) {
      return (
        <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading video consultation room...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
        <iframe
          ref={ref}
          src={url}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="w-full h-[calc(100vh-180px)] md:h-[calc(100vh-120px)] border-0"
          style={{ minHeight: "500px" }}
        />
      </div>
    );
  }
);

DailyFrame.displayName = "DailyFrame";

export default DailyFrame;
