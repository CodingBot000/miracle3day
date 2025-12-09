'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { VideoConsultTimeSlot } from '@/models/videoConsultReservation.dto';
import { formatDateTime } from '@/lib/admin/dateUtils';

interface PreferredTimesCellProps {
  slots: VideoConsultTimeSlot[];
  earliestStart?: string | null;
}

export function PreferredTimesCell({ slots, earliestStart }: PreferredTimesCellProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!slots || slots.length === 0) {
    return <span className="text-gray-400">-</span>;
  }

  const firstSlot = slots[0];

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="flex items-center gap-1 text-sm text-gray-900 hover:text-blue-600 transition-colors"
      >
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
          1순위
        </span>
        <span>{formatDateTime(earliestStart || firstSlot.start)}</span>
        {slots.length > 1 && (
          isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )
        )}
      </button>

      {isExpanded && slots.length > 1 && (
        <div className="absolute z-10 mt-1 bg-white shadow-lg rounded-md border border-gray-200 p-2 min-w-[200px]">
          {slots.map((slot, index) => (
            <div
              key={index}
              className="flex items-center gap-2 py-2 px-2 hover:bg-gray-50 rounded"
            >
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                index === 0
                  ? 'bg-blue-100 text-blue-700'
                  : index === 1
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {slot.rank || index + 1}순위
              </span>
              <span className="text-sm">{formatDateTime(slot.start)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
