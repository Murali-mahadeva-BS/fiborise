import {
  formatTargetAmount,
  getCurrentLevelProgress,
  getRequiredDoneDays,
  getTodayTarget,
  Target,
} from '@/lib/levels';

import { Habit, HabitLog } from './types';

export function getLogsForHabit(logs: HabitLog[], habitId: string): HabitLog[] {
  return logs.filter((log) => log.habitId === habitId);
}

export function getDoneLogForDate(
  logs: HabitLog[],
  habitId: string,
  localDate: string,
): HabitLog | undefined {
  return logs.find((log) => log.habitId === habitId && log.localDate === localDate);
}

export function getHabitTrackingSummary(habit: Habit, logs: HabitLog[], today: string) {
  const habitLogs = getLogsForHabit(logs, habit.id);
  const logsBeforeToday = habitLogs.filter((log) => log.localDate < today);
  const doneTodayLog = getDoneLogForDate(habitLogs, habit.id, today);
  const target = doneTodayLog
    ? getTargetFromDoneLog(doneTodayLog, habit.unit)
    : getTodayTarget(habit, logsBeforeToday, today);
  const progress = getCurrentLevelProgress(habitLogs, habit, today);

  return {
    target,
    progress,
    doneToday: Boolean(doneTodayLog),
    doneTodayLog,
    totalDoneDays: habitLogs.length,
  };
}

function getTargetFromDoneLog(log: HabitLog, unit: string): Target {
  const requiresAmount = log.level > 0;
  const requiredDoneDays = getRequiredDoneDays(log.level);

  return {
    levelSequencePosition: log.levelSequencePosition,
    level: log.level,
    amount: log.plannedAmount,
    unit,
    label: requiresAmount ? `${formatTargetAmount(log.plannedAmount)} ${unit}` : 'Just mark done',
    requiresAmount,
    requiredDoneDays,
    doneDaysInLevel: requiredDoneDays,
    isStayMode: false,
  };
}
