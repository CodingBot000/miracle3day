/**
 * Date/Time conversion utilities for video consultation reservations
 */

/**
 * Default consultation duration in minutes
 */
export const DEFAULT_CONSULTATION_DURATION_MINUTES = 30;

/**
 * Convert local date/time to UTC ISO string
 * @param date - Local date string (YYYY-MM-DD)
 * @param time - Local time string (HH:mm)
 * @param timezone - Source timezone (e.g., "Asia/Seoul")
 * @returns ISO string in UTC
 */
export function convertLocalToUtc(
  date: string,
  time: string,
  timezone: string
): string {
  // Create a date string in the local timezone
  const localDateTimeString = `${date}T${time}:00`;

  // Create a formatter to get the offset for the timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Parse the local date time
  const localDate = new Date(localDateTimeString);

  // Get the timezone offset
  const utcDate = new Date(localDate.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(localDate.toLocaleString('en-US', { timeZone: timezone }));
  const offset = utcDate.getTime() - tzDate.getTime();

  // Apply offset to get UTC
  const result = new Date(localDate.getTime() + offset);

  return result.toISOString();
}

/**
 * Convert UTC ISO string to local date/time
 * @param isoString - ISO string in UTC
 * @param timezone - Target timezone (e.g., "Asia/Seoul")
 * @returns Object with local date and time strings
 */
export function convertUtcToLocal(
  isoString: string,
  timezone: string
): { date: string; time: string; dateTime: Date } {
  const utcDate = new Date(isoString);

  // Validate the date
  if (isNaN(utcDate.getTime())) {
    const now = new Date();
    return {
      date: now.toISOString().split('T')[0],
      time: '00:00',
      dateTime: now,
    };
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const date = formatter.format(utcDate); // YYYY-MM-DD format
  const time = timeFormatter.format(utcDate); // HH:mm format

  return { date, time, dateTime: utcDate };
}

/**
 * Format date for display in Korean
 * @param isoString - ISO string
 * @param timezone - Target timezone
 * @returns Formatted date string
 */
export function formatDateKorean(
  isoString: string,
  timezone: string = 'Asia/Seoul'
): string {
  const date = new Date(isoString);

  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return formatter.format(date);
}

/**
 * Format time for display
 * @param isoString - ISO string
 * @param timezone - Target timezone
 * @returns Formatted time string (e.g., "14:30")
 */
export function formatTime(
  isoString: string,
  timezone: string = 'Asia/Seoul'
): string {
  const date = new Date(isoString);

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return formatter.format(date);
}

/**
 * Format date and time for display
 * @param isoString - ISO string
 * @param timezone - Target timezone
 * @returns Formatted datetime string
 */
export function formatDateTime(
  isoString: string | null | undefined,
  timezone: string = 'Asia/Seoul'
): string {
  if (!isoString) {
    return '-';
  }

  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    return '-';
  }

  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return formatter.format(date);
}

/**
 * Get min and max dates from slots array
 * @param slots - Array of time slots
 * @returns Object with minDate and maxDate (YYYY-MM-DD format in the given timezone)
 */
export function getDateRangeFromSlots(
  slots: Array<{ start: string; end: string }> | null | undefined,
  timezone: string = 'Asia/Seoul'
): { minDate: string; maxDate: string } {
  // Default to today if no slots or empty array
  const getDefaultDates = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    return { minDate: todayStr, maxDate: nextWeekStr };
  };

  if (!slots || slots.length === 0) {
    return getDefaultDates();
  }

  // Filter out invalid dates and collect valid timestamps
  const validTimestamps: number[] = [];
  for (const slot of slots) {
    if (slot.start) {
      const startTime = new Date(slot.start).getTime();
      if (!isNaN(startTime)) {
        validTimestamps.push(startTime);
      }
    }
    if (slot.end) {
      const endTime = new Date(slot.end).getTime();
      if (!isNaN(endTime)) {
        validTimestamps.push(endTime);
      }
    }
  }

  // If no valid timestamps found, return default dates
  if (validTimestamps.length === 0) {
    return getDefaultDates();
  }

  const minTimestamp = Math.min(...validTimestamps);
  const maxTimestamp = Math.max(...validTimestamps);

  try {
    const minLocal = convertUtcToLocal(new Date(minTimestamp).toISOString(), timezone);

    // Add 7 days to max date as per requirement
    const maxDate = new Date(maxTimestamp);
    maxDate.setDate(maxDate.getDate() + 7);
    const maxDateExtended = convertUtcToLocal(maxDate.toISOString(), timezone);

    return {
      minDate: minLocal.date,
      maxDate: maxDateExtended.date,
    };
  } catch {
    return getDefaultDates();
  }
}

/**
 * Get day of week in Korean
 * @param date - Date object
 * @returns Korean day of week (월, 화, 수, 목, 금, 토, 일)
 */
function getKoreanDayOfWeek(date: Date): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

/**
 * Format slot for display (showing both user timezone and KST)
 * @param slot - Time slot object (end is optional, will be calculated from duration if missing)
 * @param userTimezone - User's timezone
 * @param durationMinutes - Duration in minutes (default: 30)
 * @returns Formatted string showing both timezones
 */
export function formatSlotDisplay(
  slot: { start: string; end?: string } | null | undefined,
  userTimezone: string,
  durationMinutes: number = DEFAULT_CONSULTATION_DURATION_MINUTES
): { userTime: string; kstTime: string } {
  const defaultResult = { userTime: '-', kstTime: '-' };

  if (!slot || !slot.start) {
    return defaultResult;
  }

  // Validate start date
  const startDate = new Date(slot.start);
  if (isNaN(startDate.getTime())) {
    return defaultResult;
  }

  try {
    // Calculate end time if not provided
    let endIso: string;
    if (slot.end) {
      const endDate = new Date(slot.end);
      if (isNaN(endDate.getTime())) {
        return defaultResult;
      }
      endIso = slot.end;
    } else {
      // Calculate end time from start + duration
      const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
      endIso = endDate.toISOString();
    }

    const userStart = convertUtcToLocal(slot.start, userTimezone);
    const userEnd = convertUtcToLocal(endIso, userTimezone);

    const kstStart = convertUtcToLocal(slot.start, 'Asia/Seoul');
    const kstEnd = convertUtcToLocal(endIso, 'Asia/Seoul');

    // Get day of week for KST date
    const kstDayOfWeek = getKoreanDayOfWeek(kstStart.dateTime);
    const userDayOfWeek = getKoreanDayOfWeek(userStart.dateTime);

    return {
      userTime: `${userStart.date} (${userDayOfWeek}) ${userStart.time} - ${userEnd.time}`,
      kstTime: `${kstStart.date} (${kstDayOfWeek}) ${kstStart.time} - ${kstEnd.time} (KST)`,
    };
  } catch {
    return defaultResult;
  }
}
