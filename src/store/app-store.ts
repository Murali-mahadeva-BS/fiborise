import { create } from 'zustand';
import { type SQLiteDatabase } from 'expo-sqlite';

import {
  createHabit as createHabitRecord,
  listActiveHabits,
  listArchivedHabits,
} from '@/features/habits/repository';
import {
  listDoneLogs,
  markHabitDone as saveHabitDone,
  markHabitNotDone as deleteHabitDone,
} from '@/features/habits/log-repository';
import { CreateHabitInput, Habit, HabitLog, AppSettings } from '@/features/habits/types';
import {
  completeOnboarding as saveOnboardingCompleted,
  getAppSettings,
  resetOnboarding as saveOnboardingReset,
} from '@/features/settings/repository';
import { getTodayLocalDate } from '@/lib/dates';

type AppState = {
  isLoading: boolean;
  hasLoaded: boolean;
  error?: string;
  onboardingCompleted: boolean;
  settings?: AppSettings;
  habits: Habit[];
  archivedHabits: Habit[];
  logs: HabitLog[];
  loadApp: (db: SQLiteDatabase) => Promise<void>;
  completeOnboarding: (db: SQLiteDatabase) => Promise<void>;
  resetOnboarding: (db: SQLiteDatabase) => Promise<void>;
  createHabit: (db: SQLiteDatabase, input: CreateHabitInput) => Promise<Habit>;
  markHabitDone: (db: SQLiteDatabase, habitId: string, localDate?: string) => Promise<void>;
  markHabitNotDone: (db: SQLiteDatabase, habitId: string, localDate?: string) => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  isLoading: false,
  hasLoaded: false,
  onboardingCompleted: false,
  habits: [],
  archivedHabits: [],
  logs: [],

  loadApp: async (db) => {
    set({ isLoading: true, error: undefined });
    try {
      const [settings, habits, archivedHabits, logs] = await Promise.all([
        getAppSettings(db),
        listActiveHabits(db),
        listArchivedHabits(db),
        listDoneLogs(db),
      ]);

      set({
        settings,
        onboardingCompleted: Boolean(settings.onboardingCompletedAt),
        habits,
        archivedHabits,
        logs,
        isLoading: false,
        hasLoaded: true,
      });
    } catch (error) {
      set({ isLoading: false, hasLoaded: true, error: getErrorMessage(error) });
    }
  },

  completeOnboarding: async (db) => {
    await saveOnboardingCompleted(db);
    await get().loadApp(db);
  },

  resetOnboarding: async (db) => {
    await saveOnboardingReset(db);
    await get().loadApp(db);
  },

  createHabit: async (db, input) => {
    const habit = await createHabitRecord(db, input);
    const habits = await listActiveHabits(db);
    set({ habits });
    return habit;
  },

  markHabitDone: async (db, habitId, localDate = getTodayLocalDate()) => {
    const state = get();
    const habit = state.habits.find((item) => item.id === habitId);

    if (!habit) {
      throw new Error('Habit not found');
    }

    const alreadyDone = state.logs.some(
      (log) => log.habitId === habitId && log.localDate === localDate,
    );

    if (alreadyDone) {
      return;
    }

    const priorLogs = state.logs.filter(
      (log) => log.habitId === habitId && log.localDate < localDate,
    );
    await saveHabitDone(db, habit, priorLogs, localDate);
    const logs = await listDoneLogs(db);
    set({ logs });
  },

  markHabitNotDone: async (db, habitId, localDate = getTodayLocalDate()) => {
    await deleteHabitDone(db, habitId, localDate);
    const logs = await listDoneLogs(db);
    set({ logs });
  },
}));

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}
