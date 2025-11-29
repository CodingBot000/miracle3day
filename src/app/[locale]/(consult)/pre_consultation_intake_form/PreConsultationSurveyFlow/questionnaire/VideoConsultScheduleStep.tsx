'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, Calendar, Clock } from 'lucide-react';
import { useLocale } from 'next-intl';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ko } from 'date-fns/locale/ko';
import { enUS } from 'date-fns/locale/en-US';
import 'react-datepicker/dist/react-datepicker.css';

// Register locales
registerLocale('ko', ko);
registerLocale('en', enUS);

export interface VideoConsultTimeSlot {
  rank: number;
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
}

interface VideoConsultScheduleStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const VideoConsultScheduleStep: React.FC<VideoConsultScheduleStepProps> = ({ data, onDataChange }) => {
  const locale = useLocale();

  // Initialize with one empty slot
  const [slots, setSlots] = useState<VideoConsultTimeSlot[]>(
    data.videoConsultSlots || [
      { rank: 1, date: '', startTime: '' }
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

  // Convert string date to Date object
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Convert Date object to string
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Convert string time to Date object for time picker
  const parseTime = (timeStr: string): Date | null => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Convert Date object to time string
  const formatTime = (date: Date | null): string => {
    if (!date) return '';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleDateChange = (rank: number, date: Date | null) => {
    setSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.rank === rank ? { ...slot, date: formatDate(date) } : slot
      )
    );
    clearError(rank);
  };

  const handleTimeChange = (rank: number, time: Date | null) => {
    setSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.rank === rank ? { ...slot, startTime: formatTime(time) } : slot
      )
    );
    clearError(rank);
  };

  const clearError = (rank: number) => {
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
      setSlots([...slots, { rank: slots.length + 1, date: '', startTime: '' }]);
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

  // Get minimum date (tomorrow - same day booking not allowed)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .react-datepicker {
          font-family: inherit;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .react-datepicker__header {
          background-color: #fff;
          border-bottom: 1px solid #e5e7eb;
          padding-top: 0.5rem;
        }
        .react-datepicker__current-month {
          font-weight: 600;
          color: #111827;
        }
        .react-datepicker__day-name {
          color: #6b7280;
        }
        .react-datepicker__day {
          color: #111827;
          border-radius: 0.375rem;
        }
        .react-datepicker__day:hover {
          background-color: #fce7f3;
        }
        .react-datepicker__day--selected {
          background-color: #fb718f !important;
          color: white !important;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: #fce7f3;
        }
        .react-datepicker__day--disabled {
          color: #d1d5db;
        }
        .react-datepicker__time-container {
          border-left: 1px solid #e5e7eb;
        }
        .react-datepicker__time-list-item {
          height: auto !important;
          padding: 8px 10px !important;
        }
        .react-datepicker__time-list-item:hover {
          background-color: #fce7f3 !important;
        }
        .react-datepicker__time-list-item--selected {
          background-color: #fb718f !important;
        }
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__input-container {
          width: 100%;
        }
        .react-datepicker__input-container input {
          width: 100%;
          padding: 0.5rem 0.75rem 0.5rem 2.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          outline: none;
        }
        .react-datepicker__input-container input:focus {
          border-color: #fb718f;
          box-shadow: 0 0 0 2px rgba(251, 113, 143, 0.2);
        }
      `}</style>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          {locale === 'ko'
            ? '최대 3개의 희망 시간을 선택해 주세요. 병원에서 가능한 시간으로 확정해 드립니다.'
            : 'Select up to 3 preferred time slots. The clinic will confirm the best available time.'}
        </p>
      </div>

      {slots.map((slot) => (
        <div key={slot.rank} className="p-4 border border-gray-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold text-gray-800">
              {locale === 'ko' ? `희망 시간 ${slot.rank}` : `Preferred Time Slot ${slot.rank}`}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div>
              <Label className="text-sm text-gray-700 mb-2 block">
                {locale === 'ko' ? '날짜' : 'Date'}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                <DatePicker
                  selected={parseDate(slot.date)}
                  onChange={(date) => handleDateChange(slot.rank, date)}
                  minDate={tomorrow}
                  locale={locale === 'ko' ? 'ko' : 'en'}
                  dateFormat={locale === 'ko' ? 'yyyy년 MM월 dd일' : 'MMM dd, yyyy'}
                  placeholderText={locale === 'ko' ? '날짜 선택' : 'Select date'}
                  className="w-full"
                />
              </div>
            </div>

            {/* Time Picker */}
            <div>
              <Label className="text-sm text-gray-700 mb-2 block">
                {locale === 'ko' ? '시간' : 'Time'}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                <DatePicker
                  selected={parseTime(slot.startTime)}
                  onChange={(time) => handleTimeChange(slot.rank, time)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption={locale === 'ko' ? '시간' : 'Time'}
                  dateFormat="HH:mm"
                  timeFormat="HH:mm"
                  locale={locale === 'ko' ? 'ko' : 'en'}
                  placeholderText={locale === 'ko' ? '시간 선택' : 'Select time'}
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
          {locale === 'ko' ? '시간 추가하기' : 'Add Another Time Slot'}
        </Button>
      )}

      {/* Timezone info */}
      <div className="text-sm text-gray-500 text-center">
        {locale === 'ko' ? '시간대' : 'Timezone'}: {userTimezone}
      </div>
    </div>
  );
};

export default VideoConsultScheduleStep;
