import { describe, expect, it } from '@jest/globals';

import { getTodayLocalDate } from './index';

describe('date helpers', () => {
  it('formats a device-local calendar date as YYYY-MM-DD', () => {
    expect(getTodayLocalDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});
