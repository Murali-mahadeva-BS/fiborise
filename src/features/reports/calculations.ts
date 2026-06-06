import { Habit, HabitLog } from '@/features/habits/types';
import {
  addLocalDays,
  compareLocalDates,
  formatDisplayDate,
  getDaysBetween,
  getMondayWeekStart,
  getMonthEnd,
  getMonthStart,
  LocalDate,
  parseLocalDate,
} from '@/lib/dates';

import { HabitReport, LevelTimelineItem, MonthGridDay } from './types';

const weeklyWindowSize = 8;

export function buildHabitReport(habit: Habit, logs: HabitLog[], today: LocalDate): HabitReport {
  const habitLogs = getSortedHabitLogs(habit.id, logs, today);
  const doneDates = new Set(habitLogs.map((log) => log.localDate));

  return {
    totalDoneDays: habitLogs.length,
    latestStreak: getLatestStreak(habitLogs, today),
    bestStreak: getBestStreak(habitLogs),
    cumulativeAmount: sumPlannedAmount(habitLogs),
    monthLabel: getMonthLabel(today),
    monthGridDays: buildMonthGrid(doneDates, today),
    weeklyDone: buildWeeklyDone(doneDates, today),
    cumulativeAmountPoints: buildCumulativeAmountPoints(habitLogs),
    levelTimeline: buildLevelTimeline(habitLogs),
  };
}

function getSortedHabitLogs(habitId: string, logs: HabitLog[], today: LocalDate): HabitLog[] {
  return logs
    .filter((log) => log.habitId === habitId && log.localDate <= today)
    .sort((left, right) => compareLocalDates(left.localDate, right.localDate));
}

function getLatestStreak(logs: HabitLog[], today: LocalDate): number {
  if (logs.length === 0) {
    return 0;
  }

  const doneDates = new Set(logs.map((log) => log.localDate));
  const latestLog = logs[logs.length - 1];
  const yesterday = addLocalDays(today, -1);
  const streakEnd = doneDates.has(today) ? today : latestLog.localDate === yesterday ? yesterday : undefined;

  if (!streakEnd) {
    return 0;
  }

  let streak = 0;
  let cursor = streakEnd;

  while (doneDates.has(cursor)) {
    streak += 1;
    cursor = addLocalDays(cursor, -1);
  }

  return streak;
}

function getBestStreak(logs: HabitLog[]): number {
  if (logs.length === 0) {
    return 0;
  }

  let bestStreak = 1;
  let currentStreak = 1;

  for (let index = 1; index < logs.length; index += 1) {
    const previousDate = logs[index - 1].localDate;
    const currentDate = logs[index].localDate;
    const daysBetween = getDaysBetween(previousDate, currentDate);

    currentStreak = daysBetween === 1 ? currentStreak + 1 : 1;
    bestStreak = Math.max(bestStreak, currentStreak);
  }

  return bestStreak;
}

function sumPlannedAmount(logs: HabitLog[]): number {
  return logs.reduce((sum, log) => sum + log.plannedAmount, 0);
}

function buildMonthGrid(doneDates: Set<LocalDate>, today: LocalDate): MonthGridDay[] {
  const monthStart = getMonthStart(today);
  const monthEnd = getMonthEnd(today);
  const gridStart = getMondayWeekStart(monthStart);
  const gridEnd = addLocalDays(getMondayWeekStart(monthEnd), 6);
  const days: MonthGridDay[] = [];
  let cursor = gridStart;

  while (cursor <= gridEnd) {
    const date = parseLocalDate(cursor);
    days.push({
      localDate: cursor,
      dayOfMonth: date.getDate(),
      isInMonth: cursor >= monthStart && cursor <= monthEnd,
      isDone: doneDates.has(cursor),
      isFuture: cursor > today,
    });
    cursor = addLocalDays(cursor, 1);
  }

  return days;
}

function buildWeeklyDone(doneDates: Set<LocalDate>, today: LocalDate) {
  const currentWeekStart = getMondayWeekStart(today);

  return Array.from({ length: weeklyWindowSize }, (_, index) => {
    const weekStart = addLocalDays(currentWeekStart, (index - weeklyWindowSize + 1) * 7);
    let doneDays = 0;

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const localDate = addLocalDays(weekStart, dayOffset);
      if (doneDates.has(localDate)) {
        doneDays += 1;
      }
    }

    return {
      weekStart,
      label: formatDisplayDate(weekStart),
      doneDays,
    };
  });
}

function buildCumulativeAmountPoints(logs: HabitLog[]) {
  let runningAmount = 0;

  return logs.map((log) => {
    runningAmount += log.plannedAmount;

    return {
      localDate: log.localDate,
      label: formatDisplayDate(log.localDate),
      amount: runningAmount,
    };
  });
}

function buildLevelTimeline(logs: HabitLog[]): LevelTimelineItem[] {
  const timeline: LevelTimelineItem[] = [];

  for (const log of logs) {
    const lastItem = timeline[timeline.length - 1];
    if (lastItem && lastItem.level === log.level && lastItem.plannedAmount === log.plannedAmount) {
      continue;
    }

    timeline.push({
      localDate: log.localDate,
      level: log.level,
      plannedAmount: log.plannedAmount,
    });
  }

  return timeline;
}

function getMonthLabel(localDate: LocalDate): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(parseLocalDate(localDate));
}
