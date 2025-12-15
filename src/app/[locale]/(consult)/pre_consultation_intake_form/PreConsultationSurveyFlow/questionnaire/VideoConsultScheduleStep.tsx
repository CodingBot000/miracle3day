'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, Calendar, Clock, Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ko } from 'date-fns/locale/ko';
import { enUS } from 'date-fns/locale/en-US';
import { setHours, setMinutes } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import { questions } from '@/app/[locale]/(consult)/pre_consultation_intake_form/pre_consultation_intake/form-definition_pre_con_questions';
import { getLocalizedText } from '@/utils/i18n';
import {
  EnhancedTimeSlot,
  createEnhancedTimeSlot,
  isWithinDoctorAvailability,
  isDateAvailable,
  getAvailableTimesForDate,
  generateAvailabilityText,
  hasDuplicateUTCTime,
  parseEnhancedTimeSlot,
} from '@/utils/timezoneHelpers';

// Register locales
registerLocale('ko', ko);
registerLocale('en', enUS);

// Legacy interface for backward compatibility
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
  const scheduleData = questions.consultSchedule;

  // Get user timezone
  const userTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  // Initialize with one empty slot
  const [slots, setSlots] = useState<EnhancedTimeSlot[]>(() => {
    if (data.videoConsultSlotsEnhanced && data.videoConsultSlotsEnhanced.length > 0) {
      return data.videoConsultSlotsEnhanced;
    }
    return [];
  });

  const [selectedDates, setSelectedDates] = useState<(Date | null)[]>([null]);
  const [selectedTimes, setSelectedTimes] = useState<(Date | null)[]>([null]);
  const [errors, setErrors] = useState<Record<number, string>>({});

  // Generate availability text for user's timezone
  const availabilityText = useMemo(
    () => generateAvailabilityText(userTimezone, locale),
    [userTimezone, locale]
  );

  // Update parent when slots change
  useEffect(() => {
    onDataChange({
      ...data,
      videoConsultSlotsEnhanced: slots,
      videoConsultSlots: slots.map(s => ({
        rank: s.rank,
        date: s.date,
        startTime: s.startTime,
      })),
      videoConsultTimezone: userTimezone,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  const handleDateChange = (index: number, date: Date | null) => {
    const newSelectedDates = [...selectedDates];
    newSelectedDates[index] = date;
    setSelectedDates(newSelectedDates);

    // Reset time when date changes
    const newSelectedTimes = [...selectedTimes];
    newSelectedTimes[index] = null;
    setSelectedTimes(newSelectedTimes);

    // Update or remove slot
    if (!date) {
      // Remove slot if date is cleared
      removeSlotByIndex(index);
    } else if (selectedTimes[index]) {
      // Update slot if time is already selected
      updateSlot(index, date, selectedTimes[index]!);
    }

    clearError(index);
  };

  const handleTimeChange = (index: number, time: Date | null) => {
    const newSelectedTimes = [...selectedTimes];
    newSelectedTimes[index] = time;
    setSelectedTimes(newSelectedTimes);

    if (selectedDates[index] && time) {
      // Combine date and time
      const combinedDateTime = setMinutes(
        setHours(selectedDates[index]!, time.getHours()),
        time.getMinutes()
      );

      // Check if within availability
      if (!isWithinDoctorAvailability(combinedDateTime, userTimezone)) {
        setErrors(prev => ({
          ...prev,
          [index]: getLocalizedText(
            {
              ko: '선택한 시간은 상담 가능 시간이 아닙니다.',
              en: 'Selected time is outside consultation hours.',
            },
            locale
          ),
        }));
        return;
      }

      updateSlot(index, selectedDates[index]!, combinedDateTime);
    }

    clearError(index);
  };

  const updateSlot = (index: number, date: Date, dateTime: Date) => {
    // Create enhanced time slot
    const enhancedSlot = createEnhancedTimeSlot(index + 1, dateTime, userTimezone);

    // Check for duplicate UTC time
    const otherSlots = slots.filter((_, i) => i !== index);
    if (hasDuplicateUTCTime(otherSlots, enhancedSlot.dateTimeUTC)) {
      setErrors(prev => ({
        ...prev,
        [index]: getLocalizedText(
          {
            ko: '이미 선택한 시간과 중복됩니다.',
            en: 'This time slot is already selected.',
          },
          locale
        ),
      }));
      return;
    }

    // Update slots
    const newSlots = [...slots];
    newSlots[index] = enhancedSlot;
    setSlots(newSlots);

    clearError(index);
  };

  const removeSlotByIndex = (index: number) => {
    const newSlots = slots.filter((_, i) => i !== index);
    const newSelectedDates = selectedDates.filter((_, i) => i !== index);
    const newSelectedTimes = selectedTimes.filter((_, i) => i !== index);

    // Re-rank slots
    const rerankedSlots = newSlots.map((slot, i) => ({
      ...slot,
      rank: i + 1,
    }));

    setSlots(rerankedSlots);
    setSelectedDates(newSelectedDates);
    setSelectedTimes(newSelectedTimes);
    clearError(index);
  };

  const clearError = (index: number) => {
    if (errors[index]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  const addSlot = () => {
    if (selectedDates.length < 3) {
      setSelectedDates([...selectedDates, null]);
      setSelectedTimes([...selectedTimes, null]);
    }
  };

  const removeSlot = (index: number) => {
    if (selectedDates.length > 1) {
      removeSlotByIndex(index);
    }
  };

  // Filter dates: only allow dates with available time slots
  const filterDate = (date: Date): boolean => {
    // Minimum date is tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (date < tomorrow) return false;

    return isDateAvailable(date, userTimezone);
  };

  // Filter time: only allow times within doctor availability
  const filterTime = (index: number) => (time: Date): boolean => {
    if (!selectedDates[index]) return false;

    const combinedDateTime = setMinutes(
      setHours(selectedDates[index]!, time.getHours()),
      time.getMinutes()
    );

    return isWithinDoctorAvailability(combinedDateTime, userTimezone);
  };

  // Get min/max time for a specific date
  const getTimeRange = (index: number) => {
    if (!selectedDates[index]) return { minTime: null, maxTime: null };

    const range = getAvailableTimesForDate(selectedDates[index]!, userTimezone);
    if (!range) return { minTime: null, maxTime: null };

    return { minTime: range.startTime, maxTime: range.endTime };
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      {/* eslint-disable-next-line react/no-unknown-property */}
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
        .react-datepicker__time-list-item--disabled {
          color: #d1d5db !important;
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

      {/* Availability Info */}
      <div className="space-y-2">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {getLocalizedText(scheduleData.infoMessage, locale)}
          </p>
        </div>

        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Globe className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <p className="text-sm font-semibold text-purple-900">
                {locale === 'ko' ? '상담 가능 시간' : 'Consultation Hours'}
              </p>
              <p className="text-sm text-purple-800">
                <span className="font-medium">
                  {locale === 'ko' ? '귀하의 시간대:' : 'Your timezone:'}{' '}
                </span>
                {availabilityText.userTime}
              </p>
              <p className="text-xs text-purple-700">
                <span className="opacity-75">→ </span>
                {availabilityText.koreaTime}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      {selectedDates.map((selectedDate, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base md:text-lg font-semibold text-gray-800">
              {getLocalizedText(scheduleData.slotLabel, locale)} {index + 1}
              {index === 0 && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {selectedDates.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSlot(index)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div>
              <Label className="text-xs md:text-sm text-gray-700 mb-2 block">
                {getLocalizedText(scheduleData.dateLabel, locale)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => handleDateChange(index, date)}
                  minDate={tomorrow}
                  filterDate={filterDate}
                  locale={locale === 'ko' ? 'ko' : 'en'}
                  dateFormat={locale === 'ko' ? 'yyyy년 MM월 dd일' : 'MMM dd, yyyy'}
                  placeholderText={getLocalizedText(scheduleData.datePlaceholder, locale)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Time Picker */}
            <div>
              <Label className="text-xs md:text-sm text-gray-700 mb-2 block">
                {getLocalizedText(scheduleData.timeLabel, locale)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                <DatePicker
                  selected={selectedTimes[index]}
                  onChange={(time) => handleTimeChange(index, time)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption={getLocalizedText(scheduleData.timeCaption, locale)}
                  dateFormat="HH:mm"
                  timeFormat="HH:mm"
                  locale={locale === 'ko' ? 'ko' : 'en'}
                  placeholderText={getLocalizedText(scheduleData.timePlaceholder, locale)}
                  className="w-full"
                  disabled={!selectedDate}
                  filterTime={filterTime(index)}
                  minTime={getTimeRange(index).minTime || undefined}
                  maxTime={getTimeRange(index).maxTime || undefined}
                />
              </div>
            </div>
          </div>

          {/* Display selected time in both timezones */}
          {slots[index] && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs space-y-1">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-medium">
                  {locale === 'ko' ? '선택한 시간:' : 'Selected time:'}
                </span>
                <span>{slots[index].displayTime.user}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="opacity-75">→</span>
                <span className="font-medium">
                  {locale === 'ko' ? '한국 시간:' : 'Korea time:'}
                </span>
                <span>{slots[index].displayTime.korea}</span>
              </div>
            </div>
          )}

          {/* Error message for this slot */}
          {errors[index] && (
            <p className="text-sm text-red-600 mt-2">{errors[index]}</p>
          )}
        </div>
      ))}

      {/* Add Another Slot Button */}
      {selectedDates.length < 3 && (
        <Button
          type="button"
          variant="outline"
          onClick={addSlot}
          className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 text-gray-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          {getLocalizedText(scheduleData.addSlotButton, locale)}
        </Button>
      )}

      {/* Timezone info */}
      <div className="text-sm text-gray-500 text-center flex items-center justify-center gap-2">
        <Globe className="w-4 h-4" />
        <span>
          {getLocalizedText(scheduleData.timezoneLabel, locale)}: <strong>{userTimezone}</strong>
        </span>
      </div>
    </div>
  );
};

export default VideoConsultScheduleStep;
