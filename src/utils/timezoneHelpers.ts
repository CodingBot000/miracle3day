/**
 * Timezone Helper Functions for Video Consultation Scheduling
 *
 * Handles timezone conversion between user's local time and Korea Standard Time (KST)
 * Supports DST (Daylight Saving Time) and date boundary handling
 */

import { format, parse, parseISO, addDays, setHours, setMinutes } from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime, getTimezoneOffset } from 'date-fns-tz';
import { ko, enUS } from 'date-fns/locale';

// Constants
export const KOREA_TIMEZONE = 'Asia/Seoul';

// Doctor availability in KST
export interface DoctorAvailability {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  startHour: number; // 0-23
  startMinute: number; // 0-59
  endHour: number; // 0-23
  endMinute: number; // 0-59
}

// Default doctor availability (KST)
export const DOCTOR_AVAILABILITY_KST: DoctorAvailability[] = [
  // Weekdays (Monday-Friday): 20:00 - 24:00 KST
  { dayOfWeek: 1, startHour: 20, startMinute: 0, endHour: 23, endMinute: 59 },
  { dayOfWeek: 2, startHour: 20, startMinute: 0, endHour: 23, endMinute: 59 },
  { dayOfWeek: 3, startHour: 20, startMinute: 0, endHour: 23, endMinute: 59 },
  { dayOfWeek: 4, startHour: 20, startMinute: 0, endHour: 23, endMinute: 59 },
  { dayOfWeek: 5, startHour: 20, startMinute: 0, endHour: 23, endMinute: 59 },
  // Saturday: 09:00 - 24:00 KST
  { dayOfWeek: 6, startHour: 9, startMinute: 0, endHour: 23, endMinute: 59 },
  // Sunday: 09:00 - 24:00 KST
  { dayOfWeek: 0, startHour: 9, startMinute: 0, endHour: 23, endMinute: 59 },
];

/**
 * Enhanced time slot interface with timezone information
 */
export interface EnhancedTimeSlot {
  rank: number;
  dateTimeUTC: string; // ISO 8601 UTC format: '2025-12-21T11:00:00Z'
  userTimezone: string; // IANA timezone: 'America/Los_Angeles'
  displayTime: {
    user: string; // '2025-12-20 19:00 (PST)'
    korea: string; // '2025-12-21 12:00 (KST)'
  };
  // Legacy fields for backward compatibility
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
}

/**
 * Convert user's local date/time to UTC and generate all timezone information
 */
export function createEnhancedTimeSlot(
  rank: number,
  localDate: Date,
  userTimezone: string
): EnhancedTimeSlot {
  // Convert user's local time to UTC
  const utcDate = fromZonedTime(localDate, userTimezone);

  // Convert UTC to Korea time
  const koreaDate = toZonedTime(utcDate, KOREA_TIMEZONE);

  // Get timezone abbreviations
  const userTzAbbr = formatInTimeZone(utcDate, userTimezone, 'zzz', { locale: enUS });
  const koreaTzAbbr = formatInTimeZone(utcDate, KOREA_TIMEZONE, 'zzz', { locale: ko });

  return {
    rank,
    dateTimeUTC: utcDate.toISOString(),
    userTimezone,
    displayTime: {
      user: formatInTimeZone(utcDate, userTimezone, 'yyyy-MM-dd HH:mm', { locale: enUS }) + ` (${userTzAbbr})`,
      korea: formatInTimeZone(utcDate, KOREA_TIMEZONE, 'yyyy-MM-dd HH:mm', { locale: ko }) + ` (${koreaTzAbbr})`,
    },
    // Legacy fields
    date: format(localDate, 'yyyy-MM-dd'),
    startTime: format(localDate, 'HH:mm'),
  };
}

/**
 * Check if a specific date/time in user's timezone falls within doctor availability
 */
export function isWithinDoctorAvailability(
  localDateTime: Date,
  userTimezone: string
): boolean {
  // Convert to Korea time
  const koreaDateTime = toZonedTime(fromZonedTime(localDateTime, userTimezone), KOREA_TIMEZONE);
  const dayOfWeek = koreaDateTime.getDay();
  const hour = koreaDateTime.getHours();
  const minute = koreaDateTime.getMinutes();

  // Check if this day/time matches any availability slot
  return DOCTOR_AVAILABILITY_KST.some(slot => {
    if (slot.dayOfWeek !== dayOfWeek) return false;

    const timeInMinutes = hour * 60 + minute;
    const startInMinutes = slot.startHour * 60 + slot.startMinute;
    const endInMinutes = slot.endHour * 60 + slot.endMinute;

    return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
  });
}

/**
 * Filter date: only allow dates that have at least one available time slot
 */
export function isDateAvailable(date: Date, userTimezone: string): boolean {
  // Check if any time during this day (in user's timezone)
  // corresponds to doctor's available time in Korea

  // Test various times throughout the day
  const testTimes = [];
  for (let hour = 0; hour < 24; hour++) {
    const testDate = setMinutes(setHours(date, hour), 0);
    testTimes.push(testDate);
  }

  return testTimes.some(time => isWithinDoctorAvailability(time, userTimezone));
}

/**
 * Get available time range for a specific date in user's timezone
 */
export function getAvailableTimesForDate(
  date: Date,
  userTimezone: string
): { startTime: Date; endTime: Date } | null {
  // Convert date start to Korea timezone
  const userDateStart = setMinutes(setHours(date, 0), 0);

  // Find which Korea day(s) this user date spans
  const koreanDates: { dateStr: string; dayOfWeek: number }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const testDate = setHours(userDateStart, hour);
    const koreaDate = toZonedTime(fromZonedTime(testDate, userTimezone), KOREA_TIMEZONE);
    const koreaDateStr = format(koreaDate, 'yyyy-MM-dd');

    if (!koreanDates.some(d => d.dateStr === koreaDateStr)) {
      koreanDates.push({
        dateStr: koreaDateStr,
        dayOfWeek: koreaDate.getDay(),
      });
    }
  }

  // Get availability for these Korea days
  const availableSlots = DOCTOR_AVAILABILITY_KST.filter(slot =>
    koreanDates.some(kd => kd.dayOfWeek === slot.dayOfWeek)
  );

  if (availableSlots.length === 0) return null;

  // Convert Korea availability times back to user's timezone
  let minUserTime: Date | null = null;
  let maxUserTime: Date | null = null;

  availableSlots.forEach(slot => {
    // Find the actual date in Korea that matches
    const koreaDateInfo = koreanDates.find(kd => kd.dayOfWeek === slot.dayOfWeek);
    if (!koreaDateInfo) return;

    // Create Korea datetime
    const koreaStartDate = parse(
      `${koreaDateInfo.dateStr} ${String(slot.startHour).padStart(2, '0')}:${String(slot.startMinute).padStart(2, '0')}`,
      'yyyy-MM-dd HH:mm',
      new Date()
    );
    const koreaEndDate = parse(
      `${koreaDateInfo.dateStr} ${String(slot.endHour).padStart(2, '0')}:${String(slot.endMinute).padStart(2, '0')}`,
      'yyyy-MM-dd HH:mm',
      new Date()
    );

    // Convert to user's timezone
    const userStartTime = toZonedTime(fromZonedTime(koreaStartDate, KOREA_TIMEZONE), userTimezone);
    const userEndTime = toZonedTime(fromZonedTime(koreaEndDate, KOREA_TIMEZONE), userTimezone);

    // Check if these times fall on the selected date
    const userDateStr = format(date, 'yyyy-MM-dd');
    const startDateStr = format(userStartTime, 'yyyy-MM-dd');
    const endDateStr = format(userEndTime, 'yyyy-MM-dd');

    if (startDateStr === userDateStr) {
      if (!minUserTime || userStartTime < minUserTime) {
        minUserTime = userStartTime;
      }
    }

    if (endDateStr === userDateStr) {
      if (!maxUserTime || userEndTime > maxUserTime) {
        maxUserTime = userEndTime;
      }
    }
  });

  if (!minUserTime || !maxUserTime) return null;

  return { startTime: minUserTime, endTime: maxUserTime };
}

/**
 * Generate human-readable availability text in user's timezone
 */
export function generateAvailabilityText(
  userTimezone: string,
  locale: string = 'en'
): {
  userTime: string;
  koreaTime: string;
} {
  const weekdaySlots = DOCTOR_AVAILABILITY_KST.filter(s => s.dayOfWeek >= 1 && s.dayOfWeek <= 5);
  const weekendSlots = DOCTOR_AVAILABILITY_KST.filter(s => s.dayOfWeek === 0 || s.dayOfWeek === 6);

  // Create sample dates for conversion (use a specific date to ensure consistency)
  const sampleDate = new Date('2025-12-15'); // A Monday
  const sampleSaturday = new Date('2025-12-20'); // A Saturday

  // Convert weekday availability
  const weekdayStart = setMinutes(setHours(sampleDate, weekdaySlots[0].startHour), weekdaySlots[0].startMinute);
  const weekdayEnd = setMinutes(setHours(sampleDate, weekdaySlots[0].endHour), weekdaySlots[0].endMinute);

  const weekdayStartKorea = fromZonedTime(weekdayStart, KOREA_TIMEZONE);
  const weekdayEndKorea = fromZonedTime(weekdayEnd, KOREA_TIMEZONE);

  const weekdayStartUser = toZonedTime(weekdayStartKorea, userTimezone);
  const weekdayEndUser = toZonedTime(weekdayEndKorea, userTimezone);

  // Convert weekend availability (Saturday/Sunday have same hours)
  const weekendStart = setMinutes(setHours(sampleSaturday, weekendSlots[0].startHour), weekendSlots[0].startMinute);
  const weekendEnd = setMinutes(setHours(sampleSaturday, weekendSlots[0].endHour), weekendSlots[0].endMinute);

  const weekendStartKorea = fromZonedTime(weekendStart, KOREA_TIMEZONE);
  const weekendEndKorea = fromZonedTime(weekendEnd, KOREA_TIMEZONE);

  const weekendStartUser = toZonedTime(weekendStartKorea, userTimezone);
  const weekendEndUser = toZonedTime(weekendEndKorea, userTimezone);

  const timeFormat = locale === 'ko' ? 'HH:mm' : 'h:mm a';

  let userTimeText = '';
  let koreaTimeText = '';

  if (locale === 'ko') {
    userTimeText = `평일 ${format(weekdayStartUser, timeFormat)}~${format(weekdayEndUser, timeFormat)}, 주말 ${format(weekendStartUser, timeFormat)}~${format(weekendEndUser, timeFormat)} (현지 시간)`;
    koreaTimeText = `평일 오후 8시~자정, 주말 오전 9시~자정 (한국 시간)`;
  } else {
    const weekdayStartDay = format(weekdayStartUser, 'EEEE', { locale: enUS });
    const weekdayEndDay = format(weekdayEndUser, 'EEEE', { locale: enUS });

    // Check if day changes
    const weekdayDayChange = weekdayStartDay !== weekdayEndDay;
    const weekendDayChange = format(weekendStartUser, 'EEEE', { locale: enUS }) !== format(weekendEndUser, 'EEEE', { locale: enUS });

    let weekdayText = `Weekdays ${format(weekdayStartUser, timeFormat)}-${format(weekdayEndUser, timeFormat)}`;
    if (weekdayDayChange) {
      weekdayText = `${weekdayStartDay}s ${format(weekdayStartUser, timeFormat)} - ${weekdayEndDay}s ${format(weekdayEndUser, timeFormat)}`;
    }

    let weekendText = `Weekends ${format(weekendStartUser, timeFormat)}-${format(weekendEndUser, timeFormat)}`;
    if (weekendDayChange) {
      const weekendStartDay = format(weekendStartUser, 'EEEE', { locale: enUS });
      const weekendEndDay = format(weekendEndUser, 'EEEE', { locale: enUS });
      weekendText = `${weekendStartDay}s ${format(weekendStartUser, timeFormat)} - ${weekendEndDay}s ${format(weekendEndUser, timeFormat)}`;
    }

    userTimeText = `${weekdayText}, ${weekendText} (Your local time)`;
    koreaTimeText = `Weekdays 8PM-12AM, Weekends 9AM-12AM (Korea time)`;
  }

  return {
    userTime: userTimeText,
    koreaTime: koreaTimeText,
  };
}

/**
 * Check for duplicate UTC times in slots
 */
export function hasDuplicateUTCTime(
  slots: EnhancedTimeSlot[],
  newDateTimeUTC: string
): boolean {
  return slots.some(slot => slot.dateTimeUTC === newDateTimeUTC);
}

/**
 * Parse enhanced time slot from stored data
 */
export function parseEnhancedTimeSlot(data: any): EnhancedTimeSlot | null {
  try {
    if (!data.dateTimeUTC || !data.userTimezone) return null;

    const utcDate = parseISO(data.dateTimeUTC);
    return createEnhancedTimeSlot(data.rank, toZonedTime(utcDate, data.userTimezone), data.userTimezone);
  } catch (error) {
    console.error('Error parsing enhanced time slot:', error);
    return null;
  }
}
