import { LocalDate } from '@/lib/dates';

export type Habit = {
  id: string;
  name: string;
  icon: string;
  description?: string;
  baseAmount: number;
  unit: string;
  startDate: LocalDate;
  reminderEnabled: boolean;
  reminderTime?: string;
  stayModeEnabled: boolean;
  stayModeLevelSequencePosition?: number;
  stayModeLevel?: number;
  stayModeTargetAmount?: number;
  stayModeDoneDaysInLevel?: number;
  archivedAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
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

export type CreateHabitInput = {
  name: string;
  icon: string;
  description?: string;
  baseAmount: number;
  unit: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
};

export type UpdateHabitReminderInput = {
  reminderEnabled: boolean;
  reminderTime: string;
};

export type AppSettings = {
  onboardingCompletedAt?: string;
  weekStartsOn: 'monday';
  createdAt: string;
  updatedAt: string;
};
