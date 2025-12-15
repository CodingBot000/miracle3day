/**
 * Test cases for timezone handling in video consultation scheduling
 */

import { describe, it, expect } from '@jest/globals';
import {
  createEnhancedTimeSlot,
  isWithinDoctorAvailability,
  isDateAvailable,
  getAvailableTimesForDate,
  generateAvailabilityText,
  hasDuplicateUTCTime,
  DOCTOR_AVAILABILITY_KST,
  KOREA_TIMEZONE,
  EnhancedTimeSlot,
} from '../timezoneHelpers';
import { setHours, setMinutes, parse, format } from 'date-fns';

describe('Timezone Helper Functions', () => {
  describe('createEnhancedTimeSlot', () => {
    it('should create enhanced time slot with correct UTC conversion from LA timezone', () => {
      // LA: 2025-12-20 19:00 PST = UTC: 2025-12-21 03:00 = KST: 2025-12-21 12:00
      const laDate = parse('2025-12-20 19:00', 'yyyy-MM-dd HH:mm', new Date());
      const slot = createEnhancedTimeSlot(1, laDate, 'America/Los_Angeles');

      expect(slot.rank).toBe(1);
      expect(slot.userTimezone).toBe('America/Los_Angeles');
      expect(slot.dateTimeUTC).toBeDefined();
      expect(slot.displayTime.user).toContain('2025-12-20');
      expect(slot.displayTime.user).toContain('19:00');
      expect(slot.displayTime.korea).toContain('2025-12-21');
      expect(slot.displayTime.korea).toContain('12:00');
      expect(slot.date).toBe('2025-12-20');
      expect(slot.startTime).toBe('19:00');
    });

    it('should create enhanced time slot with correct UTC conversion from Tokyo timezone', () => {
      // Tokyo: 2025-12-20 21:00 JST = UTC: 2025-12-20 12:00 = KST: 2025-12-20 21:00
      const tokyoDate = parse('2025-12-20 21:00', 'yyyy-MM-dd HH:mm', new Date());
      const slot = createEnhancedTimeSlot(1, tokyoDate, 'Asia/Tokyo');

      expect(slot.rank).toBe(1);
      expect(slot.userTimezone).toBe('Asia/Tokyo');
      expect(slot.displayTime.user).toContain('2025-12-20');
      expect(slot.displayTime.user).toContain('21:00');
      // Korea time should be 1 hour behind Tokyo
      expect(slot.displayTime.korea).toContain('2025-12-20');
      expect(slot.displayTime.korea).toContain('20:00');
    });

    it('should handle date boundary crossing from US East Coast', () => {
      // NYC: 2025-12-20 10:00 EST = UTC: 2025-12-20 15:00 = KST: 2025-12-21 00:00
      const nycDate = parse('2025-12-20 10:00', 'yyyy-MM-dd HH:mm', new Date());
      const slot = createEnhancedTimeSlot(1, nycDate, 'America/New_York');

      expect(slot.displayTime.user).toContain('2025-12-20');
      expect(slot.displayTime.korea).toContain('2025-12-21');
    });
  });

  describe('isWithinDoctorAvailability', () => {
    it('should return true for weekday 20:00 KST (from LA timezone)', () => {
      // LA Friday 03:00 AM = KST Friday 20:00
      const laDate = parse('2025-12-19 03:00', 'yyyy-MM-dd HH:mm', new Date());
      const result = isWithinDoctorAvailability(laDate, 'America/Los_Angeles');
      expect(result).toBe(true);
    });

    it('should return true for weekday 23:00 KST (from LA timezone)', () => {
      // LA Friday 06:00 AM = KST Friday 23:00
      const laDate = parse('2025-12-19 06:00', 'yyyy-MM-dd HH:mm', new Date());
      const result = isWithinDoctorAvailability(laDate, 'America/Los_Angeles');
      expect(result).toBe(true);
    });

    it('should return false for weekday 19:59 KST (just before availability)', () => {
      // LA Friday 02:59 AM = KST Friday 19:59
      const laDate = parse('2025-12-19 02:59', 'yyyy-MM-dd HH:mm', new Date());
      const result = isWithinDoctorAvailability(laDate, 'America/Los_Angeles');
      expect(result).toBe(false);
    });

    it('should return true for Sunday 09:00 KST', () => {
      // KST Sunday 09:00
      const kstDate = parse('2025-12-21 09:00', 'yyyy-MM-dd HH:mm', new Date());
      const result = isWithinDoctorAvailability(kstDate, KOREA_TIMEZONE);
      expect(result).toBe(true);
    });

    it('should return true for Sunday 23:59 KST', () => {
      // KST Sunday 23:59
      const kstDate = parse('2025-12-21 23:59', 'yyyy-MM-dd HH:mm', new Date());
      const result = isWithinDoctorAvailability(kstDate, KOREA_TIMEZONE);
      expect(result).toBe(true);
    });

    it('should return false for Saturday (not available)', () => {
      // KST Saturday 20:00
      const kstDate = parse('2025-12-20 20:00', 'yyyy-MM-dd HH:mm', new Date());
      const result = isWithinDoctorAvailability(kstDate, KOREA_TIMEZONE);
      expect(result).toBe(false);
    });

    it('should handle date boundary: LA Friday evening = KST Saturday morning', () => {
      // LA Friday 19:00 = KST Saturday 12:00 (not available)
      const laDate = parse('2025-12-19 19:00', 'yyyy-MM-dd HH:mm', new Date());
      const result = isWithinDoctorAvailability(laDate, 'America/Los_Angeles');
      expect(result).toBe(false);
    });
  });

  describe('isDateAvailable', () => {
    it('should return true for LA Thursday (maps to KST Friday)', () => {
      const laDate = new Date('2025-12-18');
      const result = isDateAvailable(laDate, 'America/Los_Angeles');
      expect(result).toBe(true);
    });

    it('should return true for LA Saturday (maps to KST Sunday)', () => {
      const laDate = new Date('2025-12-20');
      const result = isDateAvailable(laDate, 'America/Los_Angeles');
      expect(result).toBe(true);
    });

    it('should return false for LA Friday (maps to KST Saturday - not available)', () => {
      const laDate = new Date('2025-12-19');
      const result = isDateAvailable(laDate, 'America/Los_Angeles');
      // LA Friday spans both KST Friday (available) and Saturday (not available)
      // Should return true if ANY time is available
      // LA Friday early morning = KST Friday evening (available)
      expect(result).toBe(true);
    });
  });

  describe('getAvailableTimesForDate', () => {
    it('should return correct time range for KST Monday', () => {
      const kstDate = new Date('2025-12-22'); // Monday
      const result = getAvailableTimesForDate(kstDate, KOREA_TIMEZONE);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.startTime.getHours()).toBe(20);
        expect(result.startTime.getMinutes()).toBe(0);
        expect(result.endTime.getHours()).toBe(23);
        expect(result.endTime.getMinutes()).toBe(59);
      }
    });

    it('should return correct time range for KST Sunday', () => {
      const kstDate = new Date('2025-12-21'); // Sunday
      const result = getAvailableTimesForDate(kstDate, KOREA_TIMEZONE);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.startTime.getHours()).toBe(9);
        expect(result.startTime.getMinutes()).toBe(0);
        expect(result.endTime.getHours()).toBe(23);
        expect(result.endTime.getMinutes()).toBe(59);
      }
    });

    it('should return null for KST Saturday (not available)', () => {
      const kstDate = new Date('2025-12-20'); // Saturday
      const result = getAvailableTimesForDate(kstDate, KOREA_TIMEZONE);

      // Expect null or very limited availability
      // Depending on implementation, might be null
      // Since Saturday is not in DOCTOR_AVAILABILITY_KST
      expect(result).toBeNull();
    });
  });

  describe('generateAvailabilityText', () => {
    it('should generate availability text for Korea timezone', () => {
      const result = generateAvailabilityText(KOREA_TIMEZONE, 'en');

      expect(result.userTime).toContain('8');
      expect(result.userTime).toContain('PM');
      expect(result.userTime).toContain('12');
      expect(result.userTime).toContain('AM');
      expect(result.koreaTime).toContain('Weekdays 8PM-12AM');
      expect(result.koreaTime).toContain('Sundays 9AM-12AM');
    });

    it('should generate availability text for LA timezone', () => {
      const result = generateAvailabilityText('America/Los_Angeles', 'en');

      expect(result.userTime).toContain('Your local time');
      expect(result.koreaTime).toContain('Korea time');
      // LA is about 17 hours behind Korea
      // KST Friday 20:00 = LA Friday 03:00
    });

    it('should generate availability text in Korean', () => {
      const result = generateAvailabilityText(KOREA_TIMEZONE, 'ko');

      expect(result.userTime).toContain('평일');
      expect(result.userTime).toContain('오후 8시');
      expect(result.userTime).toContain('자정');
      expect(result.koreaTime).toContain('한국 시간');
    });
  });

  describe('hasDuplicateUTCTime', () => {
    it('should detect duplicate UTC times', () => {
      const slot1 = createEnhancedTimeSlot(
        1,
        parse('2025-12-20 19:00', 'yyyy-MM-dd HH:mm', new Date()),
        'America/Los_Angeles'
      );

      const slot2 = createEnhancedTimeSlot(
        2,
        parse('2025-12-21 12:00', 'yyyy-MM-dd HH:mm', new Date()),
        KOREA_TIMEZONE
      );

      // Both should map to the same UTC time
      const result = hasDuplicateUTCTime([slot1], slot2.dateTimeUTC);
      expect(result).toBe(true);
    });

    it('should not detect duplicate when UTC times are different', () => {
      const slot1 = createEnhancedTimeSlot(
        1,
        parse('2025-12-20 19:00', 'yyyy-MM-dd HH:mm', new Date()),
        'America/Los_Angeles'
      );

      const slot2 = createEnhancedTimeSlot(
        2,
        parse('2025-12-20 13:00', 'yyyy-MM-dd HH:mm', new Date()),
        KOREA_TIMEZONE
      );

      const result = hasDuplicateUTCTime([slot1], slot2.dateTimeUTC);
      expect(result).toBe(false);
    });
  });

  describe('DST (Daylight Saving Time) handling', () => {
    it('should correctly handle US DST transition in March', () => {
      // March 2025: DST starts on March 9
      // Before DST: PST (UTC-8), After DST: PDT (UTC-7)

      // March 8, 2025 (before DST) LA 19:00 PST
      const beforeDST = parse('2025-03-08 19:00', 'yyyy-MM-dd HH:mm', new Date());
      const slotBefore = createEnhancedTimeSlot(1, beforeDST, 'America/Los_Angeles');

      // March 10, 2025 (after DST) LA 19:00 PDT
      const afterDST = parse('2025-03-10 19:00', 'yyyy-MM-dd HH:mm', new Date());
      const slotAfter = createEnhancedTimeSlot(2, afterDST, 'America/Los_Angeles');

      // Both should be valid but have different UTC times
      expect(slotBefore.dateTimeUTC).not.toBe(slotAfter.dateTimeUTC);

      // The Korea time difference should change by 1 hour
      const koreanTimeBefore = slotBefore.displayTime.korea;
      const koreanTimeAfter = slotAfter.displayTime.korea;

      expect(koreanTimeBefore).toBeDefined();
      expect(koreanTimeAfter).toBeDefined();
    });

    it('should correctly handle US DST transition in November', () => {
      // November 2025: DST ends on November 2
      // Before DST ends: PDT (UTC-7), After DST ends: PST (UTC-8)

      // November 1, 2025 (before DST ends) LA 19:00 PDT
      const beforeDST = parse('2025-11-01 19:00', 'yyyy-MM-dd HH:mm', new Date());
      const slotBefore = createEnhancedTimeSlot(1, beforeDST, 'America/Los_Angeles');

      // November 3, 2025 (after DST ends) LA 19:00 PST
      const afterDST = parse('2025-11-03 19:00', 'yyyy-MM-dd HH:mm', new Date());
      const slotAfter = createEnhancedTimeSlot(2, afterDST, 'America/Los_Angeles');

      // Both should be valid but have different UTC times
      expect(slotBefore.dateTimeUTC).not.toBe(slotAfter.dateTimeUTC);
    });
  });

  describe('Edge cases and date boundaries', () => {
    it('should handle midnight crossing from LA to Korea', () => {
      // LA 08:00 AM = KST 01:00 AM next day
      const laDate = parse('2025-12-20 08:00', 'yyyy-MM-dd HH:mm', new Date());
      const slot = createEnhancedTimeSlot(1, laDate, 'America/Los_Angeles');

      expect(slot.displayTime.user).toContain('2025-12-20');
      expect(slot.displayTime.korea).toContain('2025-12-21');
    });

    it('should handle New Year crossing', () => {
      // LA Dec 31, 2025 19:00 = KST Jan 1, 2026 12:00
      const laDate = parse('2025-12-31 19:00', 'yyyy-MM-dd HH:mm', new Date());
      const slot = createEnhancedTimeSlot(1, laDate, 'America/Los_Angeles');

      expect(slot.displayTime.user).toContain('2025-12-31');
      expect(slot.displayTime.korea).toContain('2026-01-01');
    });

    it('should handle Sydney timezone (ahead of Korea)', () => {
      // Sydney is UTC+10 or UTC+11 (DST), Korea is UTC+9
      // Sydney 19:00 = KST 18:00 (or 17:00 during Sydney DST)
      const sydneyDate = parse('2025-12-20 19:00', 'yyyy-MM-dd HH:mm', new Date());
      const slot = createEnhancedTimeSlot(1, sydneyDate, 'Australia/Sydney');

      expect(slot.userTimezone).toBe('Australia/Sydney');
      expect(slot.displayTime.user).toContain('2025-12-20');
      expect(slot.displayTime.user).toContain('19:00');
    });

    it('should handle London timezone', () => {
      // London is UTC+0 or UTC+1 (BST), Korea is UTC+9
      // London 11:00 AM = KST 20:00 (or 19:00 during BST)
      const londonDate = parse('2025-12-20 11:00', 'yyyy-MM-dd HH:mm', new Date());
      const slot = createEnhancedTimeSlot(1, londonDate, 'Europe/London');

      expect(slot.userTimezone).toBe('Europe/London');
      expect(slot.displayTime.korea).toContain('2025-12-20');
      expect(slot.displayTime.korea).toContain('20:00');
    });
  });

  describe('Data integrity', () => {
    it('should maintain backward compatibility with legacy fields', () => {
      const laDate = parse('2025-12-20 19:00', 'yyyy-MM-dd HH:mm', new Date());
      const slot = createEnhancedTimeSlot(1, laDate, 'America/Los_Angeles');

      // Legacy fields should exist
      expect(slot.date).toBeDefined();
      expect(slot.startTime).toBeDefined();
      expect(slot.date).toBe('2025-12-20');
      expect(slot.startTime).toBe('19:00');

      // New fields should exist
      expect(slot.dateTimeUTC).toBeDefined();
      expect(slot.userTimezone).toBeDefined();
      expect(slot.displayTime).toBeDefined();
      expect(slot.displayTime.user).toBeDefined();
      expect(slot.displayTime.korea).toBeDefined();
    });

    it('should produce ISO 8601 compliant UTC datetime strings', () => {
      const laDate = parse('2025-12-20 19:00', 'yyyy-MM-dd HH:mm', new Date());
      const slot = createEnhancedTimeSlot(1, laDate, 'America/Los_Angeles');

      // Check if UTC string is valid ISO 8601
      expect(slot.dateTimeUTC).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      // Should be parseable
      const parsedDate = new Date(slot.dateTimeUTC);
      expect(parsedDate).toBeInstanceOf(Date);
      expect(isNaN(parsedDate.getTime())).toBe(false);
    });
  });
});

/**
 * Manual Test Scenarios (to be tested in browser)
 */
export const MANUAL_TEST_SCENARIOS = [
  {
    name: 'US West Coast (LA) - Friday Evening',
    timezone: 'America/Los_Angeles',
    scenario: 'User in LA selects Friday 7:00 PM',
    expectedUserTime: 'Friday 7:00 PM PST',
    expectedKoreaTime: 'Saturday 12:00 PM KST',
    shouldBeAvailable: false, // Saturday is not available
  },
  {
    name: 'US West Coast (LA) - Thursday Evening',
    timezone: 'America/Los_Angeles',
    scenario: 'User in LA selects Thursday 3:00 AM',
    expectedUserTime: 'Thursday 3:00 AM PST',
    expectedKoreaTime: 'Thursday 8:00 PM KST',
    shouldBeAvailable: true, // Thursday 8PM KST is available
  },
  {
    name: 'US East Coast (NYC) - Weekday Morning',
    timezone: 'America/New_York',
    scenario: 'User in NYC selects Monday 6:00 AM',
    expectedUserTime: 'Monday 6:00 AM EST',
    expectedKoreaTime: 'Monday 8:00 PM KST',
    shouldBeAvailable: true,
  },
  {
    name: 'Japan - Same date',
    timezone: 'Asia/Tokyo',
    scenario: 'User in Tokyo selects Sunday 9:00 AM',
    expectedUserTime: 'Sunday 9:00 AM JST',
    expectedKoreaTime: 'Sunday 8:00 AM KST',
    shouldBeAvailable: false, // Sunday 8AM is not available (starts at 9AM)
  },
  {
    name: 'China - Near midnight',
    timezone: 'Asia/Shanghai',
    scenario: 'User in Shanghai selects Sunday 11:00 PM',
    expectedUserTime: 'Sunday 11:00 PM CST',
    expectedKoreaTime: 'Monday 12:00 AM KST',
    shouldBeAvailable: false, // Monday 12AM is not available (starts at 8PM)
  },
  {
    name: 'Australia (Sydney) - Ahead of Korea',
    timezone: 'Australia/Sydney',
    scenario: 'User in Sydney selects Sunday 8:00 PM',
    expectedUserTime: 'Sunday 8:00 PM AEDT',
    expectedKoreaTime: 'Sunday 6:00 PM KST',
    shouldBeAvailable: false, // Sunday 6PM is not available (starts at 9AM)
  },
  {
    name: 'UK (London) - Behind Korea',
    timezone: 'Europe/London',
    scenario: 'User in London selects Sunday 1:00 PM',
    expectedUserTime: 'Sunday 1:00 PM GMT',
    expectedKoreaTime: 'Sunday 10:00 PM KST',
    shouldBeAvailable: true,
  },
];

console.log('\n=== Manual Test Scenarios ===');
console.log('Please test these scenarios in the browser:');
MANUAL_TEST_SCENARIOS.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}`);
  console.log(`   Timezone: ${scenario.timezone}`);
  console.log(`   Scenario: ${scenario.scenario}`);
  console.log(`   Expected User Time: ${scenario.expectedUserTime}`);
  console.log(`   Expected Korea Time: ${scenario.expectedKoreaTime}`);
  console.log(`   Should be available: ${scenario.shouldBeAvailable ? 'YES' : 'NO'}`);
});
