import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';

export interface VideoConsultTimeSlot {
  rank: number;
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
}

interface VideoConsultScheduleStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const VideoConsultScheduleStep: React.FC<VideoConsultScheduleStepProps> = ({ data, onDataChange }) => {
  const { language } = useCookieLanguage();

  // Initialize with one empty slot
  const [slots, setSlots] = useState<VideoConsultTimeSlot[]>(
    data.videoConsultSlots || [
      { rank: 1, date: '', startTime: '', endTime: '' }
    ]
  );

  const [errors, setErrors] = useState<Record<number, string>>({});

  // Get user timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Update parent when slots change
  useEffect(() => {
    onDataChange({
      ...data,
      videoConsultSlots: slots,
      videoConsultTimezone: userTimezone
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  const handleSlotChange = (rank: number, field: keyof VideoConsultTimeSlot, value: string) => {
    setSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.rank === rank ? { ...slot, [field]: value } : slot
      )
    );

    // Clear error for this slot when user makes changes
    if (errors[rank]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[rank];
        return newErrors;
      });
    }
  };

  const addSlot = () => {
    if (slots.length < 3) {
      setSlots([...slots, { rank: slots.length + 1, date: '', startTime: '', endTime: '' }]);
    }
  };

  const removeSlot = (rank: number) => {
    if (slots.length > 1) {
      const newSlots = slots
        .filter(slot => slot.rank !== rank)
        .map((slot, index) => ({ ...slot, rank: index + 1 }));
      setSlots(newSlots);

      // Clear error for removed slot
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[rank];
        return newErrors;
      });
    }
  };

  const validateSlot = (slot: VideoConsultTimeSlot): string | null => {
    if (!slot.date || !slot.startTime || !slot.endTime) {
      return language === 'ko'
        ? '날짜, 시작 시간, 종료 시간을 모두 입력해주세요'
        : 'Please fill in date, start time, and end time';
    }

    if (slot.startTime >= slot.endTime) {
      return language === 'ko'
        ? '시작 시간은 종료 시간보다 이전이어야 합니다'
        : 'Start time must be before end time';
    }

    return null;
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          {language === 'ko'
            ? '최대 3개의 희망 시간을 선택해 주세요. 병원에서 가능한 시간으로 확정해 드립니다.'
            : 'Select up to 3 preferred time slots. The clinic will confirm the best available time.'}
        </p>
      </div>

      {slots.map((slot, index) => (
        <div key={slot.rank} className="p-4 border border-gray-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold text-gray-800">
              {language === 'ko' ? `희망 시간 ${slot.rank}` : `Preferred Time Slot ${slot.rank}`}
              {slot.rank === 1 && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {slots.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSlot(slot.rank)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Date Picker */}
            <div>
              <Label htmlFor={`date-${slot.rank}`} className="text-sm text-gray-700 mb-2 block">
                {language === 'ko' ? '날짜' : 'Date'}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id={`date-${slot.rank}`}
                type="date"
                min={today}
                value={slot.date}
                onChange={(e) => handleSlotChange(slot.rank, 'date', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Time Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`start-${slot.rank}`} className="text-sm text-gray-700 mb-2 block">
                  {language === 'ko' ? '시작 시간' : 'Start Time'}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id={`start-${slot.rank}`}
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => handleSlotChange(slot.rank, 'startTime', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor={`end-${slot.rank}`} className="text-sm text-gray-700 mb-2 block">
                  {language === 'ko' ? '종료 시간' : 'End Time'}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id={`end-${slot.rank}`}
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => handleSlotChange(slot.rank, 'endTime', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Error message for this slot */}
          {errors[slot.rank] && (
            <p className="text-sm text-red-600 mt-2">{errors[slot.rank]}</p>
          )}
        </div>
      ))}

      {/* Add Another Slot Button */}
      {slots.length < 3 && (
        <Button
          type="button"
          variant="outline"
          onClick={addSlot}
          className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 text-gray-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          {language === 'ko' ? '시간 추가하기' : 'Add Another Time Slot'}
        </Button>
      )}

      {/* Timezone info */}
      <div className="text-sm text-gray-500 text-center">
        {language === 'ko' ? '시간대' : 'Timezone'}: {userTimezone}
      </div>
    </div>
  );
};

export default VideoConsultScheduleStep;
