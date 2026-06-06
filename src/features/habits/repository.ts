import { type SQLiteDatabase } from 'expo-sqlite';

import { formatIsoTimestamp, getTodayLocalDate } from '@/lib/dates';
import { createLocalId } from '@/lib/ids';

import { CreateHabitInput, Habit } from './types';

type HabitRow = {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  base_amount: number;
  unit: string;
  start_date: string;
  reminder_enabled: number;
  reminder_time: string | null;
  stay_mode_enabled: number;
  stay_mode_level_sequence_position: number | null;
  stay_mode_level: number | null;
  stay_mode_target_amount: number | null;
  stay_mode_done_days_in_level: number | null;
  archived_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function listActiveHabits(db: SQLiteDatabase): Promise<Habit[]> {
  const rows = await db.getAllAsync<HabitRow>(
    `SELECT *
     FROM habits
     WHERE archived_at IS NULL AND deleted_at IS NULL
     ORDER BY created_at ASC`,
  );

  return rows.map(mapHabitRow);
}

export async function listArchivedHabits(db: SQLiteDatabase): Promise<Habit[]> {
  const rows = await db.getAllAsync<HabitRow>(
    `SELECT *
     FROM habits
     WHERE archived_at IS NOT NULL AND deleted_at IS NULL
     ORDER BY archived_at DESC`,
  );

  return rows.map(mapHabitRow);
}

export async function getHabitById(db: SQLiteDatabase, id: string): Promise<Habit | undefined> {
  const row = await db.getFirstAsync<HabitRow>(
    `SELECT *
     FROM habits
     WHERE id = ? AND deleted_at IS NULL`,
    id,
  );

  return row ? mapHabitRow(row) : undefined;
}

export async function createHabit(
  db: SQLiteDatabase,
  input: CreateHabitInput,
  options: { id?: string; today?: string; nowIso?: string } = {},
): Promise<Habit> {
  const nowIso = options.nowIso ?? formatIsoTimestamp();
  const habit: Habit = {
    id: options.id ?? createLocalId('habit'),
    name: input.name.trim(),
    icon: input.icon.trim(),
    description: input.description?.trim() || undefined,
    baseAmount: input.baseAmount,
    unit: input.unit.trim(),
    startDate: options.today ?? getTodayLocalDate(),
    reminderEnabled: Boolean(input.reminderEnabled),
    reminderTime: input.reminderTime,
    stayModeEnabled: false,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await db.runAsync(
    `INSERT INTO habits (
       id, name, icon, description, base_amount, unit, start_date,
       reminder_enabled, reminder_time, stay_mode_enabled,
       stay_mode_level_sequence_position, stay_mode_level, stay_mode_target_amount,
       stay_mode_done_days_in_level, archived_at, deleted_at, created_at, updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    habit.id,
    habit.name,
    habit.icon,
    habit.description ?? null,
    habit.baseAmount,
    habit.unit,
    habit.startDate,
    habit.reminderEnabled ? 1 : 0,
    habit.reminderTime ?? null,
    habit.stayModeEnabled ? 1 : 0,
    habit.stayModeLevelSequencePosition ?? null,
    habit.stayModeLevel ?? null,
    habit.stayModeTargetAmount ?? null,
    habit.stayModeDoneDaysInLevel ?? null,
    habit.archivedAt ?? null,
    habit.deletedAt ?? null,
    habit.createdAt,
    habit.updatedAt,
  );

  return habit;
}

export async function archiveHabit(
  db: SQLiteDatabase,
  habitId: string,
  nowIso = formatIsoTimestamp(),
) {
  await db.runAsync(
    `UPDATE habits
     SET archived_at = ?, reminder_enabled = 0, updated_at = ?
     WHERE id = ? AND archived_at IS NULL AND deleted_at IS NULL`,
    nowIso,
    nowIso,
    habitId,
  );
}

export async function deleteArchivedHabit(
  db: SQLiteDatabase,
  habitId: string,
  nowIso = formatIsoTimestamp(),
) {
  await db.runAsync(
    `UPDATE habits
     SET deleted_at = ?, updated_at = ?
     WHERE id = ? AND archived_at IS NOT NULL AND deleted_at IS NULL`,
    nowIso,
    nowIso,
    habitId,
  );
}

function mapHabitRow(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    description: row.description ?? undefined,
    baseAmount: row.base_amount,
    unit: row.unit,
    startDate: row.start_date,
    reminderEnabled: row.reminder_enabled === 1,
    reminderTime: row.reminder_time ?? undefined,
    stayModeEnabled: row.stay_mode_enabled === 1,
    stayModeLevelSequencePosition: row.stay_mode_level_sequence_position ?? undefined,
    stayModeLevel: row.stay_mode_level ?? undefined,
    stayModeTargetAmount: row.stay_mode_target_amount ?? undefined,
    stayModeDoneDaysInLevel: row.stay_mode_done_days_in_level ?? undefined,
    archivedAt: row.archived_at ?? undefined,
    deletedAt: row.deleted_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
