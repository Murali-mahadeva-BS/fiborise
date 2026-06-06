import { describe, expect, it } from '@jest/globals';

import {
  formatReminderTimeLabel,
  getHabitReminderIdentifier,
  isValidReminderTime,
  parseReminderTime,
  reminderTimeToDate,
  timeFromDate,
} from './index';

describe('reminder helpers', () => {
  it('validates 24-hour HH:mm reminder times', () => {
    expect(isValidReminderTime('00:00')).toBe(true);
    expect(isValidReminderTime('08:30')).toBe(true);
    expect(isValidReminderTime('23:59')).toBe(true);
    expect(isValidReminderTime('24:00')).toBe(false);
    expect(isValidReminderTime('8:00')).toBe(false);
  });

  it('parses reminder time into hour and minute values', () => {
    expect(parseReminderTime('21:05')).toEqual({ hour: 21, minute: 5 });
  });

  it('builds deterministic notification identifiers per habit', () => {
    expect(getHabitReminderIdentifier('habit-running')).toBe('habit-reminder-habit-running');
  });

  it('converts between stored HH:mm values and Date values', () => {
    const date = reminderTimeToDate('08:05');

    expect(date.getHours()).toBe(8);
    expect(date.getMinutes()).toBe(5);
    expect(timeFromDate(date)).toBe('08:05');
  });

  it('formats reminder times as AM/PM labels', () => {
    expect(formatReminderTimeLabel('00:00')).toBe('12:00 AM');
    expect(formatReminderTimeLabel('08:30')).toBe('8:30 AM');
    expect(formatReminderTimeLabel('12:00')).toBe('12:00 PM');
    expect(formatReminderTimeLabel('21:05')).toBe('9:05 PM');
  });
});
