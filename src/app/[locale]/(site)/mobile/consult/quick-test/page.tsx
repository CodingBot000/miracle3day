"use client";

/**
 * Quick Test Page - Pure iframe implementation
 * This page tests if Jitsi works with a simple iframe (no external_api.js)
 * Used to isolate issues between iframe permissions and API integration
 */
export default function QuickTest() {
  const room = "beautylink-quicktest";

  return (
    <main className="w-full h-screen p-2">
      <h1 className="text-sm mb-2 font-semibold">Jitsi Quick Test (Pure IFrame)</h1>
      <p className="text-xs text-gray-600 mb-2">
        Testing camera/microphone permissions with pure iframe approach
      </p>
      <div className="w-full h-[90vh]">
        <iframe
          src={`https://meet.jit.si/${room}`}
          allow="camera; microphone; fullscreen; display-capture"
          style={{ width: "100%", height: "100%", border: 0, borderRadius: 12 }}
          title="Jitsi Quick Test"
        />
      </div>
    </main>
  );
}
