"use client";

import { Channel } from 'stream-chat';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { CustomChannelData } from '@/types/stream-chat';

interface ChannelHeaderProps {
  channel: Channel | null;
}

export default function ChannelHeader({ channel }: ChannelHeaderProps) {
  const router = useRouter();

  if (!channel) {
    return (
      <div className="h-16 border-b flex items-center px-4 bg-white">
        <div className="text-gray-500">Loading channel info...</div>
      </div>
    );
  }

  // Extract info from channel custom fields (do not parse channel.id)
  const channelData = channel.data as CustomChannelData | undefined;
  const hospitalName = channelData?.hospitalName || 'Hospital';
  const userName = channelData?.userName || 'User';
  const hospitalId = channelData?.hospitalId; // Full UUID

  const handleBack = () => {
    if (hospitalId) {
      router.push(`/hospital/${hospitalId}`);
    } else {
      router.back();
    }
  };

  return (
    <div className="h-16 border-b flex items-center px-4 bg-white shadow-sm">
      <button
        onClick={handleBack}
        className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="flex-1">
        <h1 className="text-lg font-semibold text-gray-900">
          {hospitalName}
        </h1>
        <p className="text-sm text-gray-500">
          1:1 Consultation
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Online</span>
      </div>
    </div>
  );
}
