import { LocalDate } from '@/lib/dates';

export type MonthGridDay = {
  localDate: LocalDate;
  dayOfMonth: number;
  isInMonth: boolean;
  isDone: boolean;
  isFuture: boolean;
};

export type WeeklyDonePoint = {
  weekStart: LocalDate;
  label: string;
  doneDays: number;
};

export type CumulativeAmountPoint = {
  localDate: LocalDate;
  label: string;
  amount: number;
};

export type LevelTimelineItem = {
  localDate: LocalDate;
  level: number;
  plannedAmount: number;
};

export type HabitReport = {
  totalDoneDays: number;
  latestStreak: number;
  bestStreak: number;
  cumulativeAmount: number;
  monthLabel: string;
  monthGridDays: MonthGridDay[];
  weeklyDone: WeeklyDonePoint[];
  cumulativeAmountPoints: CumulativeAmountPoint[];
  levelTimeline: LevelTimelineItem[];
};
