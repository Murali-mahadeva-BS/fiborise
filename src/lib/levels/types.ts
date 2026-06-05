export type LocalDate = string;

export type Habit = {
  id: string;
  name: string;
  baseAmount: number;
  unit: string;
  startDate: LocalDate;
  stayModeEnabled?: boolean;
  stayModeLevelSequencePosition?: number;
  stayModeLevel?: number;
  stayModeTargetAmount?: number;
  stayModeDoneDaysInLevel?: number;
};

export type HabitLog = {
  id: string;
  habitId: string;
  localDate: LocalDate;
  levelSequencePosition: number;
  level: number;
  plannedAmount: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type LevelProgress = {
  levelSequencePosition: number;
  level: number;
  requiredDoneDays: number;
  doneDaysInLevel: number;
  remainingDoneDays: number;
  targetAmount: number;
  isStayMode: boolean;
};

export type Target = {
  levelSequencePosition: number;
  level: number;
  amount: number;
  unit: string;
  label: string;
  requiresAmount: boolean;
  requiredDoneDays: number;
  doneDaysInLevel: number;
  isStayMode: boolean;
};
