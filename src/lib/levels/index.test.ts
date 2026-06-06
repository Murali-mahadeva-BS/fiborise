import { describe, expect, it } from '@jest/globals';

import {
  buildDoneLog,
  canEditDate,
  getCurrentLevelProgress,
  getLevelForSequencePosition,
  getRequiredDoneDays,
  getTargetAmount,
  getTodayTarget,
  Habit,
  HabitLog,
} from './index';

const habit: Habit = {
  id: 'habit-running',
  name: 'Running',
  baseAmount: 100,
  unit: 'm',
  startDate: '2026-06-01',
};

function addDoneLog(logs: HabitLog[], localDate: string): HabitLog[] {
  return [...logs, buildDoneLog(habit, logs, localDate, `${localDate}T06:00:00.000Z`)];
}

describe('Level engine', () => {
  it('uses Fibonacci level sequence starting with 0, 1, 1, 2', () => {
    expect(Array.from({ length: 8 }, (_, index) => getLevelForSequencePosition(index))).toEqual([
      0, 1, 1, 2, 3, 5, 8, 13,
    ]);
  });

  it('requires one done day for level 0 and level-value days after that', () => {
    expect(getRequiredDoneDays(0)).toBe(1);
    expect(getRequiredDoneDays(1)).toBe(1);
    expect(getRequiredDoneDays(2)).toBe(2);
    expect(getRequiredDoneDays(5)).toBe(5);
  });

  it('calculates target amount from base amount and level', () => {
    expect(getTargetAmount(100, 0)).toBe(0);
    expect(getTargetAmount(100, 2)).toBe(200);
    expect(getTargetAmount(0.5, 3)).toBe(1.5);
  });

  it('progresses through level 0, level 1, level 1, and level 2 from done logs only', () => {
    let logs: HabitLog[] = [];

    expect(getTodayTarget(habit, logs, '2026-06-01')).toMatchObject({
      level: 0,
      label: 'Just mark done',
      requiredDoneDays: 1,
    });

    logs = addDoneLog(logs, '2026-06-01');
    expect(getTodayTarget(habit, logs, '2026-06-02')).toMatchObject({
      levelSequencePosition: 1,
      level: 1,
      amount: 100,
      doneDaysInLevel: 0,
    });

    logs = addDoneLog(logs, '2026-06-02');
    expect(getTodayTarget(habit, logs, '2026-06-03')).toMatchObject({
      levelSequencePosition: 2,
      level: 1,
      amount: 100,
    });

    logs = addDoneLog(logs, '2026-06-03');
    expect(getTodayTarget(habit, logs, '2026-06-04')).toMatchObject({
      levelSequencePosition: 3,
      level: 2,
      amount: 200,
      requiredDoneDays: 2,
      doneDaysInLevel: 0,
    });

    logs = addDoneLog(logs, '2026-06-04');
    expect(getTodayTarget(habit, logs, '2026-06-05')).toMatchObject({
      levelSequencePosition: 3,
      level: 2,
      doneDaysInLevel: 1,
    });

    logs = addDoneLog(logs, '2026-06-05');
    expect(getTodayTarget(habit, logs, '2026-06-06')).toMatchObject({
      levelSequencePosition: 4,
      level: 3,
      amount: 300,
    });
  });

  it('does not advance for skipped calendar days', () => {
    const logs = addDoneLog([], '2026-06-01');
    const targetAfterSkip = getTodayTarget(habit, logs, '2026-06-10');

    expect(targetAfterSkip).toMatchObject({
      levelSequencePosition: 1,
      level: 1,
      amount: 100,
    });
  });

  it('allows changing only today', () => {
    expect(canEditDate('2026-06-05', '2026-06-05')).toBe(true);
    expect(canEditDate('2026-06-04', '2026-06-05')).toBe(false);
    expect(canEditDate('2026-06-06', '2026-06-05')).toBe(false);
  });

  it('freezes progress while stay mode is enabled', () => {
    const stayModeHabit: Habit = {
      ...habit,
      stayModeEnabled: true,
      stayModeLevelSequencePosition: 3,
      stayModeLevel: 2,
      stayModeTargetAmount: 200,
      stayModeDoneDaysInLevel: 1,
    };
    const logs = [
      buildDoneLog(habit, [], '2026-06-01'),
      buildDoneLog(habit, [], '2026-06-02'),
      buildDoneLog(habit, [], '2026-06-03'),
      buildDoneLog(habit, [], '2026-06-04'),
      buildDoneLog(habit, [], '2026-06-05'),
      buildDoneLog(habit, [], '2026-06-06'),
    ];

    expect(getCurrentLevelProgress(logs, stayModeHabit, '2026-06-07')).toMatchObject({
      isStayMode: true,
      levelSequencePosition: 3,
      level: 2,
      targetAmount: 200,
      doneDaysInLevel: 1,
    });
  });

  it('does not count stay mode done logs toward future progression', () => {
    const growthLogs = [
      buildDoneLog(habit, [], '2026-06-01'),
      buildDoneLog(habit, [], '2026-06-02'),
      buildDoneLog(habit, [], '2026-06-03'),
    ];
    const stayModeHabit: Habit = {
      ...habit,
      stayModeEnabled: true,
      stayModeLevelSequencePosition: 3,
      stayModeLevel: 2,
      stayModeTargetAmount: 200,
      stayModeDoneDaysInLevel: 0,
    };
    const stayModeLog = buildDoneLog(stayModeHabit, growthLogs, '2026-06-04');

    expect(stayModeLog).toMatchObject({
      levelSequencePosition: 3,
      level: 2,
      plannedAmount: 200,
      countsTowardProgress: false,
    });

    expect(
      getCurrentLevelProgress([...growthLogs, stayModeLog], habit, '2026-06-05'),
    ).toMatchObject({
      levelSequencePosition: 3,
      level: 2,
      doneDaysInLevel: 0,
    });
  });
});
