import { LocalDate } from "@/lib/dates";

export type MonthGridDay = {
  localDate: LocalDate;
  dayOfMonth: number;
  isInMonth: boolean;
  isDone: boolean;
  isFuture: boolean;
};

export type CumulativeAmountPoint = {
  localDate: LocalDate;
  label: string;
  amount: number;
  totalDoneDays: number;
};

export type HabitReport = {
  totalDoneDays: number;
  latestStreak: number;
  bestStreak: number;
  cumulativeAmount: number;
  monthLabel: string;
  monthGridDays: MonthGridDay[];
  cumulativeAmountPoints: CumulativeAmountPoint[];
};
