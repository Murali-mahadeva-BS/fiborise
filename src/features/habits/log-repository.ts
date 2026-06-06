import { type SQLiteDatabase } from 'expo-sqlite';

import { buildDoneLog } from '@/lib/levels';

import { Habit, HabitLog } from './types';

type HabitLogRow = {
  id: string;
  habit_id: string;
  local_date: string;
  level_sequence_position: number;
  level: number;
  planned_amount: number;
  counts_toward_progress: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export async function listDoneLogs(db: SQLiteDatabase): Promise<HabitLog[]> {
  const rows = await db.getAllAsync<HabitLogRow>(
    `SELECT *
     FROM habit_logs
     ORDER BY local_date ASC, created_at ASC`,
  );

  return rows.map(mapHabitLogRow);
}

export async function listDoneLogsForHabit(
  db: SQLiteDatabase,
  habitId: string,
): Promise<HabitLog[]> {
  const rows = await db.getAllAsync<HabitLogRow>(
    `SELECT *
     FROM habit_logs
     WHERE habit_id = ?
     ORDER BY local_date ASC`,
    habitId,
  );

  return rows.map(mapHabitLogRow);
}

export async function markHabitDone(
  db: SQLiteDatabase,
  habit: Habit,
  habitLogs: HabitLog[],
  localDate: string,
): Promise<HabitLog> {
  const log = buildDoneLog(habit, habitLogs, localDate);

  await db.runAsync(
    `INSERT OR REPLACE INTO habit_logs (
       id, habit_id, local_date, level_sequence_position, level,
       planned_amount, counts_toward_progress, note, created_at, updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    log.id,
    log.habitId,
    log.localDate,
    log.levelSequencePosition,
    log.level,
    log.plannedAmount,
    log.countsTowardProgress === false ? 0 : 1,
    log.note ?? null,
    log.createdAt,
    log.updatedAt,
  );

  return log;
}

export async function markHabitNotDone(
  db: SQLiteDatabase,
  habitId: string,
  localDate: string,
): Promise<void> {
  await db.runAsync(
    `DELETE FROM habit_logs
     WHERE habit_id = ? AND local_date = ?`,
    habitId,
    localDate,
  );
}

function mapHabitLogRow(row: HabitLogRow): HabitLog {
  return {
    id: row.id,
    habitId: row.habit_id,
    localDate: row.local_date,
    levelSequencePosition: row.level_sequence_position,
    level: row.level,
    plannedAmount: row.planned_amount,
    countsTowardProgress: row.counts_toward_progress === 1,
    note: row.note ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
