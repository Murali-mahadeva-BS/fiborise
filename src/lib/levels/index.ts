import { Habit, HabitLog, LevelProgress, LocalDate, Target } from './types';

export function getLevelForSequencePosition(position: number): number {
  assertNonNegativeInteger(position, 'position');

  if (position === 0) {
    return 0;
  }

  let previous = 0;
  let current = 1;

  for (let index = 1; index < position; index += 1) {
    const next = previous + current;
    previous = current;
    current = next;
  }

  return current;
}

export function getRequiredDoneDays(level: number): number {
  assertNonNegativeInteger(level, 'level');
  return level === 0 ? 1 : level;
}

export function getTargetAmount(baseAmount: number, level: number): number {
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
    throw new Error('baseAmount must be greater than 0');
  }

  assertNonNegativeInteger(level, 'level');
  return baseAmount * level;
}

export function canEditDate(localDate: LocalDate, today: LocalDate): boolean {
  return localDate === today;
}

export function getCurrentLevelProgress(
  doneLogs: HabitLog[],
  habit: Habit,
  today: LocalDate,
): LevelProgress {
  const progression = habit.stayModeEnabled
    ? getFrozenProgress(doneLogs, habit, today)
    : reduceDoneLogsToProgress(doneLogs, habit, today);

  const targetAmount =
    habit.stayModeEnabled && habit.stayModeTargetAmount !== undefined
      ? habit.stayModeTargetAmount
      : getTargetAmount(habit.baseAmount, progression.level);

  return {
    ...progression,
    targetAmount,
    isStayMode: Boolean(habit.stayModeEnabled),
  };
}

export function getTodayTarget(
  habit: Habit,
  doneLogs: HabitLog[],
  today: LocalDate,
): Target {
  const progress = getCurrentLevelProgress(doneLogs, habit, today);
  const requiresAmount = progress.level > 0;

  return {
    levelSequencePosition: progress.levelSequencePosition,
    level: progress.level,
    amount: progress.targetAmount,
    unit: habit.unit,
    label: requiresAmount
      ? `${formatTargetAmount(progress.targetAmount)} ${habit.unit}`
      : 'Just mark done',
    requiresAmount,
    requiredDoneDays: progress.requiredDoneDays,
    doneDaysInLevel: progress.doneDaysInLevel,
    isStayMode: progress.isStayMode,
  };
}

export function buildDoneLog(
  habit: Habit,
  doneLogs: HabitLog[],
  today: LocalDate,
  nowIso = new Date().toISOString(),
): HabitLog {
  if (!canEditDate(today, today)) {
    throw new Error('Only today can be edited');
  }

  const target = getTodayTarget(habit, doneLogs, today);

  return {
    id: `log_${habit.id}_${today}`,
    habitId: habit.id,
    localDate: today,
    levelSequencePosition: target.levelSequencePosition,
    level: target.level,
    plannedAmount: target.amount,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

function getFrozenProgress(
  doneLogs: HabitLog[],
  habit: Habit,
  today: LocalDate,
): Omit<LevelProgress, 'targetAmount' | 'isStayMode'> {
  const liveProgress = reduceDoneLogsToProgress(doneLogs, habit, today);
  const levelSequencePosition =
    habit.stayModeLevelSequencePosition ?? liveProgress.levelSequencePosition;
  const level = habit.stayModeLevel ?? getLevelForSequencePosition(levelSequencePosition);
  const requiredDoneDays = getRequiredDoneDays(level);
  const doneDaysInLevel = Math.min(
    habit.stayModeDoneDaysInLevel ?? liveProgress.doneDaysInLevel,
    requiredDoneDays,
  );

  return {
    levelSequencePosition,
    level,
    requiredDoneDays,
    doneDaysInLevel,
    remainingDoneDays: Math.max(requiredDoneDays - doneDaysInLevel, 0),
  };
}

function reduceDoneLogsToProgress(
  doneLogs: HabitLog[],
  habit: Habit,
  today: LocalDate,
): Omit<LevelProgress, 'targetAmount' | 'isStayMode'> {
  let levelSequencePosition = 0;
  let doneDaysInLevel = 0;

  const sortedLogs = doneLogs
    .filter(
      (log) =>
        log.habitId === habit.id &&
        log.localDate >= habit.startDate &&
        log.localDate <= today,
    )
    .sort((left, right) => left.localDate.localeCompare(right.localDate));

  for (let logIndex = 0; logIndex < sortedLogs.length; logIndex += 1) {
    const level = getLevelForSequencePosition(levelSequencePosition);
    const requiredDoneDays = getRequiredDoneDays(level);
    doneDaysInLevel += 1;

    if (doneDaysInLevel >= requiredDoneDays) {
      levelSequencePosition += 1;
      doneDaysInLevel = 0;
    }
  }

  const level = getLevelForSequencePosition(levelSequencePosition);
  const requiredDoneDays = getRequiredDoneDays(level);

  return {
    levelSequencePosition,
    level,
    requiredDoneDays,
    doneDaysInLevel,
    remainingDoneDays: Math.max(requiredDoneDays - doneDaysInLevel, 0),
  };
}

export function formatTargetAmount(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : String(Number(amount.toFixed(3)));
}

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
}

export type { Habit, HabitLog, LevelProgress, LocalDate, Target };
