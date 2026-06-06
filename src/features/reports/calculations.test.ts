import { describe, expect, it } from '@jest/globals';

import { Habit, HabitLog } from '@/features/habits/types';

import { buildHabitReport } from './calculations';

const habit: Habit = {
  id: 'habit-running',
  name: 'Running',
  icon: '🏃',
  baseAmount: 100,
  unit: 'm',
  startDate: '2026-06-01',
  reminderEnabled: false,
  stayModeEnabled: false,
  createdAt: '2026-06-01T05:00:00.000Z',
  updatedAt: '2026-06-01T05:00:00.000Z',
};

function log(
  localDate: string,
  levelSequencePosition: number,
  level: number,
  plannedAmount: number,
): HabitLog {
  return {
    id: `log-${localDate}`,
    habitId: habit.id,
    localDate,
    levelSequencePosition,
    level,
    plannedAmount,
    createdAt: `${localDate}T05:00:00.000Z`,
    updatedAt: `${localDate}T05:00:00.000Z`,
  };
}

describe('report calculations', () => {
  it('builds done-focused report metrics without storing missed days', () => {
    const report = buildHabitReport(
      habit,
      [
        log('2026-06-01', 0, 0, 0),
        log('2026-06-02', 1, 1, 100),
        log('2026-06-04', 2, 1, 100),
        log('2026-06-05', 3, 2, 200),
        log('2026-06-06', 3, 2, 200),
      ],
      '2026-06-06',
    );

    expect(report.totalDoneDays).toBe(5);
    expect(report.latestStreak).toBe(3);
    expect(report.bestStreak).toBe(3);
    expect(report.cumulativeAmount).toBe(600);
    expect(report.weeklyDone.at(-1)).toMatchObject({
      weekStart: '2026-06-01',
      doneDays: 5,
    });
    expect(report.cumulativeAmountPoints.at(-1)).toMatchObject({
      localDate: '2026-06-06',
      amount: 600,
    });
  });

  it('keeps today unmarked from breaking the latest streak when yesterday was done', () => {
    const report = buildHabitReport(
      habit,
      [
        log('2026-06-04', 2, 1, 100),
        log('2026-06-05', 3, 2, 200),
      ],
      '2026-06-06',
    );

    expect(report.latestStreak).toBe(2);
  });

  it('builds month grid and level timeline entries', () => {
    const report = buildHabitReport(
      habit,
      [
        log('2026-06-01', 0, 0, 0),
        log('2026-06-02', 1, 1, 100),
        log('2026-06-03', 2, 1, 100),
        log('2026-06-04', 3, 2, 200),
      ],
      '2026-06-10',
    );

    expect(report.monthLabel).toBe('June 2026');
    expect(report.monthGridDays).toHaveLength(35);
    expect(report.monthGridDays.find((day) => day.localDate === '2026-06-03')).toMatchObject({
      isDone: true,
      dayOfMonth: 3,
    });
    expect(report.levelTimeline).toEqual([
      { localDate: '2026-06-01', level: 0, plannedAmount: 0 },
      { localDate: '2026-06-02', level: 1, plannedAmount: 100 },
      { localDate: '2026-06-04', level: 2, plannedAmount: 200 },
    ]);
  });
});
