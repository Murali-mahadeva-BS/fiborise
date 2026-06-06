import { create } from 'zustand';
import { type SQLiteDatabase } from 'expo-sqlite';

import {
  archiveHabit as archiveHabitRecord,
  createHabit as createHabitRecord,
  deleteArchivedHabit as deleteArchivedHabitRecord,
  listActiveHabits,
  listArchivedHabits,
  updateHabitReminder as updateHabitReminderRecord,
  updateHabitStayMode as updateHabitStayModeRecord,
} from '@/features/habits/repository';
import { getHabitTrackingSummary } from '@/features/habits/selectors';
import {
  listDoneLogs,
  markHabitDone as saveHabitDone,
  markHabitNotDone as deleteHabitDone,
} from '@/features/habits/log-repository';
import {
  AppSettings,
  CreateHabitInput,
  Habit,
  HabitLog,
  UpdateHabitReminderInput,
} from '@/features/habits/types';
import {
  completeOnboarding as saveOnboardingCompleted,
  getAppSettings,
  resetOnboarding as saveOnboardingReset,
} from '@/features/settings/repository';
import { getTodayLocalDate } from '@/lib/dates';
import { getCurrentLevelProgress } from '@/lib/levels';
import { cancelHabitReminder, scheduleHabitReminder } from '@/lib/notifications/reminders';
import { defaultReminderTime } from '@/lib/reminders';

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
  archiveHabit: (db: SQLiteDatabase, habitId: string) => Promise<void>;
  deleteArchivedHabit: (db: SQLiteDatabase, habitId: string) => Promise<void>;
  updateHabitReminder: (
    db: SQLiteDatabase,
    habitId: string,
    input: UpdateHabitReminderInput,
  ) => Promise<boolean>;
  updateHabitStayMode: (db: SQLiteDatabase, habitId: string, enabled: boolean) => Promise<void>;
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
    if (habit.reminderEnabled && habit.reminderTime) {
      const scheduled = await scheduleReminderForHabit(habit, [], habit.reminderTime);
      if (!scheduled) {
        await updateHabitReminderRecord(db, habit.id, {
          reminderEnabled: false,
          reminderTime: habit.reminderTime,
        });
      }
    }
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
    await refreshReminderForHabit(db, habit, logs);
  },

  markHabitNotDone: async (db, habitId, localDate = getTodayLocalDate()) => {
    await deleteHabitDone(db, habitId, localDate);
    const logs = await listDoneLogs(db);
    set({ logs });

    const habit = get().habits.find((item) => item.id === habitId);
    if (habit) {
      await refreshReminderForHabit(db, habit, logs);
    }
  },

  archiveHabit: async (db, habitId) => {
    await cancelHabitReminder(habitId);
    await archiveHabitRecord(db, habitId);
    await get().loadApp(db);
  },

  deleteArchivedHabit: async (db, habitId) => {
    await cancelHabitReminder(habitId);
    await deleteArchivedHabitRecord(db, habitId);
    await get().loadApp(db);
  },

  updateHabitReminder: async (db, habitId, input) => {
    const habit = get().habits.find((item) => item.id === habitId);

    if (!habit) {
      throw new Error('Habit not found');
    }

    const reminderTime = input.reminderTime || habit.reminderTime || defaultReminderTime;

    if (input.reminderEnabled) {
      const scheduled = await scheduleReminderForHabit(habit, get().logs, reminderTime);
      if (!scheduled) {
        return false;
      }
    } else {
      await cancelHabitReminder(habit.id);
    }

    await updateHabitReminderRecord(db, habit.id, {
      reminderEnabled: input.reminderEnabled,
      reminderTime,
    });
    await get().loadApp(db);
    return true;
  },

  updateHabitStayMode: async (db, habitId, enabled) => {
    const state = get();
    const habit = state.habits.find((item) => item.id === habitId);

    if (!habit) {
      throw new Error('Habit not found');
    }

    if (enabled) {
      const today = getTodayLocalDate();
      const progress = getCurrentLevelProgress(
        state.logs.filter((log) => log.habitId === habit.id),
        { ...habit, stayModeEnabled: false },
        today,
      );

      await updateHabitStayModeRecord(db, habit.id, {
        stayModeEnabled: true,
        levelSequencePosition: progress.levelSequencePosition,
        level: progress.level,
        targetAmount: progress.targetAmount,
        doneDaysInLevel: progress.doneDaysInLevel,
      });
    } else {
      await updateHabitStayModeRecord(db, habit.id, {
        stayModeEnabled: false,
      });
    }

    await get().loadApp(db);
    const updatedHabit = get().habits.find((item) => item.id === habitId);
    if (updatedHabit) {
      await refreshReminderForHabit(db, updatedHabit, get().logs);
    }
  },
}));

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

async function refreshReminderForHabit(db: SQLiteDatabase, habit: Habit, logs: HabitLog[]) {
  if (!habit.reminderEnabled || !habit.reminderTime) {
    return;
  }

  const scheduled = await scheduleReminderForHabit(habit, logs, habit.reminderTime);
  if (!scheduled) {
    await updateHabitReminderRecord(db, habit.id, {
      reminderEnabled: false,
      reminderTime: habit.reminderTime,
    });
  }
}

async function scheduleReminderForHabit(
  habit: Habit,
  logs: HabitLog[],
  reminderTime: string,
): Promise<boolean> {
  const today = getTodayLocalDate();
  const summary = getHabitTrackingSummary(habit, logs, today);

  return scheduleHabitReminder({
    habitId: habit.id,
    habitName: habit.name,
    reminderTime,
    targetLabel: summary.target.label,
  });
}
