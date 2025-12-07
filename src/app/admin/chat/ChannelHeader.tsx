'use client';

import type { Channel } from 'stream-chat';

interface ChannelHeaderProps {
  channel: Channel;
  onBack: () => void;
}

export default function ChannelHeader({ channel, onBack }: ChannelHeaderProps) {
  // Use channel.data for customer information
  const channelData = channel.data as Record<string, unknown> | undefined;
  const customerName = (channelData?.userName as string) || (channelData?.name as string) || '알 수 없는 사용자';
  const customerImage = channelData?.userImage as string | undefined;

  return (
    <div className="bg-white shadow-md p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Customer profile */}
          <div className="flex items-center gap-3">
            {customerImage ? (
              <img
                src={customerImage}
                alt={customerName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}

            <div>
              <h2 className="font-semibold text-gray-800">{customerName}</h2>
              <p className="text-sm text-gray-500">고객 상담방</p>
            </div>
          </div>
        </div>

        {/* Optional: Channel info or actions */}
        <div className="text-sm text-gray-500">
          {channel.state.messages.length > 0 && (
            <span>{channel.state.messages.length}개 메시지</span>
          )}
        </div>
      </div>
    </div>
  );
}
