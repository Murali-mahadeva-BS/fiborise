import { describe, expect, it } from '@jest/globals';

import {
  addLocalDays,
  getDaysBetween,
  getMondayWeekStart,
  getMonthEnd,
  getMonthStart,
  getTodayLocalDate,
} from './index';

describe('date helpers', () => {
  it('formats a device-local calendar date as YYYY-MM-DD', () => {
    expect(getTodayLocalDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });

  it('adds days and calculates day distance between local dates', () => {
    expect(addLocalDays('2026-06-30', 1)).toBe('2026-07-01');
    expect(getDaysBetween('2026-06-30', '2026-07-02')).toBe(2);
  });

  it('returns Monday week starts and month bounds', () => {
    expect(getMondayWeekStart('2026-06-07')).toBe('2026-06-01');
    expect(getMondayWeekStart('2026-06-03')).toBe('2026-06-01');
    expect(getMonthStart('2026-06-18')).toBe('2026-06-01');
    expect(getMonthEnd('2026-06-18')).toBe('2026-06-30');
  });
});
