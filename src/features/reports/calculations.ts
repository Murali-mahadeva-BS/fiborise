import { Habit, HabitLog } from "@/features/habits/types";
import {
  addLocalDays,
  compareLocalDates,
  formatMonthYear,
  getDaysBetween,
  getMondayWeekStart,
  getMonthEnd,
  getMonthStart,
  LocalDate,
  parseLocalDate,
} from "@/lib/dates";

import { CumulativeAmountPoint, HabitReport, MonthGridDay } from "./types";

export function buildHabitReport(
  habit: Habit,
  logs: HabitLog[],
  today: LocalDate,
  viewedMonth: LocalDate = today,
): HabitReport {
  const habitLogs = getSortedHabitLogs(habit.id, logs, today);
  const doneDates = new Set(habitLogs.map((log) => log.localDate));
  const cumulativeAmountPoints = buildCumulativeAmountPoints(habitLogs);

  return {
    totalDoneDays: habitLogs.length,
    latestStreak: getLatestStreak(habitLogs, today),
    bestStreak: getBestStreak(habitLogs),
    cumulativeAmount: sumPlannedAmount(habitLogs),
    monthLabel: formatMonthYear(viewedMonth),
    monthGridDays: buildMonthGrid(doneDates, today, viewedMonth),
    cumulativeAmountPoints,
  };
}

function getSortedHabitLogs(
  habitId: string,
  logs: HabitLog[],
  today: LocalDate,
): HabitLog[] {
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
  const streakEnd = doneDates.has(today)
    ? today
    : latestLog.localDate === yesterday
      ? yesterday
      : undefined;

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

function buildMonthGrid(
  doneDates: Set<LocalDate>,
  today: LocalDate,
  viewedMonth: LocalDate,
): MonthGridDay[] {
  const monthStart = getMonthStart(viewedMonth);
  const monthEnd = getMonthEnd(viewedMonth);
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

function buildCumulativeAmountPoints(
  logs: HabitLog[],
): CumulativeAmountPoint[] {
  let runningAmount = 0;

  return logs.map((log, index) => {
    runningAmount += log.plannedAmount;

    return {
      localDate: log.localDate,
      label: String(index + 1),
      amount: runningAmount,
      totalDoneDays: index + 1,
    };
  });
}
