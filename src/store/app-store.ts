import { create } from "zustand";
import { type SQLiteDatabase } from "expo-sqlite";

import {
  archiveHabit as archiveHabitRecord,
  createHabit as createHabitRecord,
  deleteArchivedHabit as deleteArchivedHabitRecord,
  listActiveHabits,
  listArchivedHabits,
  restoreHabit as restoreHabitRecord,
  updateHabitIdentity as updateHabitIdentityRecord,
  updateHabitReminder as updateHabitReminderRecord,
  updateHabitStayMode as updateHabitStayModeRecord,
} from "@/features/habits/repository";
import { getHabitTrackingSummary } from "@/features/habits/selectors";
import {
  listDoneLogs,
  markHabitDone as saveHabitDone,
  markHabitNotDone as deleteHabitDone,
} from "@/features/habits/log-repository";
import {
  AppSettings,
  CreateHabitInput,
  Habit,
  HabitLog,
  ThemePreference,
  UpdateHabitIdentityInput,
  UpdateHabitReminderInput,
} from "@/features/habits/types";
import {
  getAppSettings,
  updateThemePreference as saveThemePreference,
} from "@/features/settings/repository";
import { getTodayLocalDate } from "@/lib/dates";
import { canEditDate, getCurrentLevelProgress } from "@/lib/levels";
import {
  cancelHabitReminder,
  scheduleHabitReminder,
} from "@/lib/notifications/reminders";
import { defaultReminderTime } from "@/lib/reminders";

type AppState = {
  isLoading: boolean;
  hasLoaded: boolean;
  error?: string;
  settings?: AppSettings;
  habits: Habit[];
  archivedHabits: Habit[];
  logs: HabitLog[];
  loadApp: (db: SQLiteDatabase) => Promise<void>;
  createHabit: (db: SQLiteDatabase, input: CreateHabitInput) => Promise<Habit>;
  markHabitDone: (
    db: SQLiteDatabase,
    habitId: string,
    localDate?: string,
  ) => Promise<void>;
  markHabitNotDone: (
    db: SQLiteDatabase,
    habitId: string,
    localDate?: string,
  ) => Promise<void>;
  archiveHabit: (db: SQLiteDatabase, habitId: string) => Promise<void>;
  restoreArchivedHabit: (db: SQLiteDatabase, habitId: string) => Promise<void>;
  deleteArchivedHabit: (db: SQLiteDatabase, habitId: string) => Promise<void>;
  updateHabitIdentity: (
    db: SQLiteDatabase,
    habitId: string,
    input: UpdateHabitIdentityInput,
  ) => Promise<void>;
  updateHabitReminder: (
    db: SQLiteDatabase,
    habitId: string,
    input: UpdateHabitReminderInput,
  ) => Promise<boolean>;
  updateHabitStayMode: (
    db: SQLiteDatabase,
    habitId: string,
    enabled: boolean,
  ) => Promise<void>;
  updateThemePreference: (
    db: SQLiteDatabase,
    themePreference: ThemePreference,
  ) => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  isLoading: false,
  hasLoaded: false,
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

  createHabit: async (db, input) => {
    const habit = await createHabitRecord(db, input);

    if (habit.reminderEnabled && habit.reminderTime) {
      const scheduled = await scheduleReminderForHabit(
        habit,
        [],
        habit.reminderTime,
      );
      if (!scheduled) {
        await updateHabitReminderRecord(db, habit.id, {
          reminderEnabled: false,
          reminderTime: habit.reminderTime,
        });
      }
    }

    const habits = await listActiveHabits(db);
    set({ habits });

    return habits.find((item) => item.id === habit.id) ?? habit;
  },

  markHabitDone: async (db, habitId, localDate = getTodayLocalDate()) => {
    const state = get();
    const habit = state.habits.find((item) => item.id === habitId);
    const today = getTodayLocalDate();

    if (!habit) {
      throw new Error("Habit not found");
    }

    if (!canEditDate(localDate, today)) {
      throw new Error("Only today can be edited");
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

    await refreshReminderIfNeeded(db, habit, logs, set);
  },

  markHabitNotDone: async (db, habitId, localDate = getTodayLocalDate()) => {
    const today = getTodayLocalDate();

    if (!canEditDate(localDate, today)) {
      throw new Error("Only today can be edited");
    }

    await deleteHabitDone(db, habitId, localDate);

    const logs = await listDoneLogs(db);
    set({ logs });

    const habit = get().habits.find((item) => item.id === habitId);
    if (habit) {
      await refreshReminderIfNeeded(db, habit, logs, set);
    }
  },

  archiveHabit: async (db, habitId) => {
    await cancelHabitReminder(habitId);
    await archiveHabitRecord(db, habitId);

    const [habits, archivedHabits] = await Promise.all([
      listActiveHabits(db),
      listArchivedHabits(db),
    ]);

    set({ habits, archivedHabits });
  },

  restoreArchivedHabit: async (db, habitId) => {
    await restoreHabitRecord(db, habitId);

    const [habits, archivedHabits] = await Promise.all([
      listActiveHabits(db),
      listArchivedHabits(db),
    ]);

    set({ habits, archivedHabits });
  },

  deleteArchivedHabit: async (db, habitId) => {
    await cancelHabitReminder(habitId);
    await deleteArchivedHabitRecord(db, habitId);

    const archivedHabits = await listArchivedHabits(db);
    set({ archivedHabits });
  },

  updateHabitIdentity: async (db, habitId, input) => {
    await updateHabitIdentityRecord(db, habitId, input);

    const habits = await listActiveHabits(db);
    set({ habits });

    const updatedHabit = habits.find((item) => item.id === habitId);
    if (updatedHabit) {
      await refreshReminderIfNeeded(db, updatedHabit, get().logs, set);
    }
  },

  updateHabitReminder: async (db, habitId, input) => {
    const habit = get().habits.find((item) => item.id === habitId);

    if (!habit) {
      throw new Error("Habit not found");
    }

    const reminderTime =
      input.reminderTime || habit.reminderTime || defaultReminderTime;

    if (input.reminderEnabled) {
      const scheduled = await scheduleReminderForHabit(
        habit,
        get().logs,
        reminderTime,
      );
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

    const habits = await listActiveHabits(db);
    set({ habits });
    return true;
  },

  updateHabitStayMode: async (db, habitId, enabled) => {
    const state = get();
    const habit = state.habits.find((item) => item.id === habitId);

    if (!habit) {
      throw new Error("Habit not found");
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

    const habits = await listActiveHabits(db);
    set({ habits });

    const updatedHabit = habits.find((item) => item.id === habitId);
    if (updatedHabit) {
      await refreshReminderIfNeeded(db, updatedHabit, get().logs, set);
    }
  },

  updateThemePreference: async (db, themePreference) => {
    await saveThemePreference(db, themePreference);
    const settings = await getAppSettings(db);
    set({ settings });
  },
}));

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

async function refreshReminderIfNeeded(
  db: SQLiteDatabase,
  habit: Habit,
  logs: HabitLog[],
  setState: (partial: Partial<AppState>) => void,
) {
  const scheduled = await refreshReminderForHabit(db, habit, logs);

  if (!scheduled) {
    const habits = await listActiveHabits(db);
    setState({ habits });
  }
}

async function refreshReminderForHabit(
  db: SQLiteDatabase,
  habit: Habit,
  logs: HabitLog[],
): Promise<boolean> {
  if (!habit.reminderEnabled || !habit.reminderTime) {
    return true;
  }

  const scheduled = await scheduleReminderForHabit(
    habit,
    logs,
    habit.reminderTime,
  );
  if (!scheduled) {
    await updateHabitReminderRecord(db, habit.id, {
      reminderEnabled: false,
      reminderTime: habit.reminderTime,
    });
    return false;
  }

  return true;
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
