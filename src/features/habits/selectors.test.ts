import { describe, expect, it } from '@jest/globals';

import { getHabitTrackingSummary } from './selectors';
import { Habit, HabitLog } from './types';

const habit: Habit = {
  id: 'habit-running',
  name: 'Running',
  icon: '🏃',
  baseAmount: 100,
  unit: 'm',
  startDate: '2026-06-06',
  reminderEnabled: false,
  stayModeEnabled: false,
  createdAt: '2026-06-06T04:00:00.000Z',
  updatedAt: '2026-06-06T04:00:00.000Z',
};

const todayDoneLog: HabitLog = {
  id: 'log_habit-running_2026-06-06',
  habitId: habit.id,
  localDate: '2026-06-06',
  levelSequencePosition: 0,
  level: 0,
  plannedAmount: 0,
  createdAt: '2026-06-06T05:00:00.000Z',
  updatedAt: '2026-06-06T05:00:00.000Z',
};

describe('habit selectors', () => {
  it('shows the completed target for today after marking done', () => {
    const summary = getHabitTrackingSummary(habit, [todayDoneLog], '2026-06-06');

    expect(summary.doneToday).toBe(true);
    expect(summary.target).toMatchObject({
      level: 0,
      label: 'Just mark done',
    });
    expect(summary.progress).toMatchObject({
      level: 1,
      doneDaysInLevel: 0,
    });
  });

  it('shows the next target on the next calendar day', () => {
    const summary = getHabitTrackingSummary(habit, [todayDoneLog], '2026-06-07');

    expect(summary.doneToday).toBe(false);
    expect(summary.target).toMatchObject({
      level: 1,
      label: '100 m',
    });
  });
});
