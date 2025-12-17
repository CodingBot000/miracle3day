'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Calendar, Clock, Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { setHours, setMinutes, format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import { enUS } from 'date-fns/locale/en-US';
import { questions } from '@/app/[locale]/(consult)/pre_consultation_intake_form/pre_consultation_intake/form-definition_pre_con_questions';
import { getLocalizedText } from '@/utils/i18n';
import { cn } from '@/lib/utils';
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

  const [selectedDates, setSelectedDates] = useState<(Date | null)[]>(() => {
    if (data.videoConsultSlotsEnhanced && data.videoConsultSlotsEnhanced.length > 0) {
      return data.videoConsultSlotsEnhanced.map((slot: EnhancedTimeSlot) => {
        // Parse the date from the slot (format: 'YYYY-MM-DD')
        const dateParts = slot.date.split('-');
        return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      });
    }
    return [null];
  });

  const [selectedTimes, setSelectedTimes] = useState<(Date | null)[]>(() => {
    if (data.videoConsultSlotsEnhanced && data.videoConsultSlotsEnhanced.length > 0) {
      return data.videoConsultSlotsEnhanced.map((slot: EnhancedTimeSlot) => {
        // Parse the time from the slot (format: 'HH:mm')
        const [hours, minutes] = slot.startTime.split(':').map(Number);
        return setMinutes(setHours(new Date(), hours), minutes);
      });
    }
    return [null];
  });
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [openPopovers, setOpenPopovers] = useState<Record<number, boolean>>({});

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

  const handleDateChange = (index: number, date: Date | undefined) => {
    console.log('[handleDateChange] Called:', { index, date, currentDate: selectedDates[index], currentTime: selectedTimes[index] });

    // Capture current state values before any updates
    const currentDate = selectedDates[index];
    const currentTime = selectedTimes[index];

    // Check if same date is being selected (before handling undefined)
    const isSameDate = currentDate && date &&
      currentDate.getFullYear() === date.getFullYear() &&
      currentDate.getMonth() === date.getMonth() &&
      currentDate.getDate() === date.getDate();

    // IMPORTANT: If same date is selected again, Calendar sends undefined (toggle behavior)
    // We need to detect this and just close the popover without clearing the date
    // This applies even if time is not selected yet (currentTime can be null)
    if (!date && currentDate) {
      console.log('[handleDateChange] Detected Calendar toggle (same date re-click). Preserving date selection.');
      setOpenPopovers(prev => ({ ...prev, [index]: false }));
      return;
    }

    // Update date state
    setSelectedDates(prev => {
      const updated = [...prev];
      updated[index] = date || null;
      return updated;
    });

    // Only reset time if date actually changed
    if (!isSameDate) {
      setSelectedTimes(prev => {
        const updated = [...prev];
        updated[index] = null;
        return updated;
      });
    }

    // Close popover
    setOpenPopovers(prev => ({ ...prev, [index]: false }));

    // Update or remove slot
    if (!date) {
      // Remove slot if date is cleared (but not from same-date re-click)
      console.log('[handleDateChange] Removing slot because date is cleared');
      removeSlotByIndex(index);
    } else if (!isSameDate && currentTime) {
      // Date changed and time exists - update slot with new date
      console.log('[handleDateChange] Updating slot with new date');
      const combinedDateTime = setMinutes(
        setHours(date, currentTime.getHours()),
        currentTime.getMinutes()
      );
      updateSlot(index, date, combinedDateTime);
    } else {
      console.log('[handleDateChange] No action needed - slot preserved');
    }

    clearError(index);
  };

  const handleTimeChange = (index: number, timeString: string) => {
    if (!selectedDates[index]) return;

    // Parse time string (HH:mm)
    const [hours, minutes] = timeString.split(':').map(Number);
    const time = setMinutes(setHours(new Date(), hours), minutes);

    const newSelectedTimes = [...selectedTimes];
    newSelectedTimes[index] = time;
    setSelectedTimes(newSelectedTimes);

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

  // Generate time options for a specific date
  const generateTimeOptions = (index: number): string[] => {
    if (!selectedDates[index]) return [];

    const range = getAvailableTimesForDate(selectedDates[index]!, userTimezone);
    if (!range) return [];

    const options: string[] = [];
    const date = selectedDates[index]!;

    // Generate 30-minute intervals from start to end
    let current = new Date(date);
    current.setHours(range.startTime.getHours(), range.startTime.getMinutes(), 0, 0);

    const end = new Date(date);
    end.setHours(range.endTime.getHours(), range.endTime.getMinutes(), 0, 0);

    while (current <= end) {
      const timeString = format(current, 'HH:mm');

      // Check if this time is within doctor availability
      const combinedDateTime = setMinutes(
        setHours(date, current.getHours()),
        current.getMinutes()
      );

      if (isWithinDoctorAvailability(combinedDateTime, userTimezone)) {
        options.push(timeString);
      }

      // Add 30 minutes
      current = new Date(current.getTime() + 30 * 60 * 1000);
    }

    return options;
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Get date-fns locale
  const dateLocale = locale === 'ko' ? ko : enUS;

  return (
    <div className="space-y-6">
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
              <Popover
                open={openPopovers[index]}
                onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, [index]: open }))}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal pl-10 relative",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    {selectedDate ? (
                      format(selectedDate, locale === 'ko' ? 'yyyy년 MM월 dd일' : 'MMM dd, yyyy', {
                        locale: dateLocale,
                      })
                    ) : (
                      <span>{getLocalizedText(scheduleData.datePlaceholder, locale)}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={(date) => handleDateChange(index, date)}
                    disabled={(date) => !filterDate(date)}
                    locale={dateLocale}
                    className="rounded-md border p-0"
                    classNames={{
                      months: "flex flex-col sm:flex-row p-0",
                      month: "space-y-4 p-0",
                      caption: "flex justify-center pt-1 pb-2 relative",
                      caption_label: "text-sm font-medium",
                      nav: "flex items-center gap-1",
                      nav_button: cn(
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                      ),
                      nav_button_previous: "",
                      nav_button_next: "",
                      table: "w-full border-collapse p-0",
                      head_row: "flex w-full",
                      head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex-1 flex items-center justify-center",
                      row: "flex w-full mt-2",
                      cell: "flex-1 text-center text-sm p-0 relative",
                      day: cn(
                        "h-9 w-9 p-0 font-normal mx-auto"
                      ),
                      day_selected: "bg-[#fb718f] text-white hover:bg-[#fb718f] hover:text-white focus:bg-[#fb718f] focus:text-white",
                      day_today: "bg-accent text-accent-foreground",
                      day_disabled: "!text-gray-400 !opacity-40 !cursor-not-allowed hover:!bg-transparent",
                      day_outside: "text-gray-300 opacity-50",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker */}
            <div>
              <Label className="text-xs md:text-sm text-gray-700 mb-2 block">
                {getLocalizedText(scheduleData.timeLabel, locale)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                <Select
                  value={selectedTimes[index] ? format(selectedTimes[index]!, 'HH:mm') : ''}
                  onValueChange={(value) => handleTimeChange(index, value)}
                  disabled={!selectedDate}
                >
                  <SelectTrigger className="w-full pl-10">
                    <SelectValue placeholder={getLocalizedText(scheduleData.timePlaceholder, locale)} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {generateTimeOptions(index).map((timeOption) => (
                      <SelectItem key={timeOption} value={timeOption}>
                        {timeOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
