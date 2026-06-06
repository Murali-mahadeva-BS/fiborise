import { type SQLiteDatabase } from 'expo-sqlite';

import { formatIsoTimestamp } from '@/lib/dates';

import { AppSettings } from '../habits/types';

type SettingsRow = {
  onboarding_completed_at: string | null;
  week_starts_on: 'monday';
  created_at: string;
  updated_at: string;
};

export async function getAppSettings(db: SQLiteDatabase): Promise<AppSettings> {
  await ensureSettingsRow(db);
  const row = await db.getFirstAsync<SettingsRow>(
    `SELECT onboarding_completed_at, week_starts_on, created_at, updated_at
     FROM app_settings
     WHERE id = 'default'`,
  );

  if (!row) {
    throw new Error('App settings could not be loaded');
  }

  return mapSettingsRow(row);
}

export async function completeOnboarding(db: SQLiteDatabase, nowIso = formatIsoTimestamp()) {
  await ensureSettingsRow(db, nowIso);
  await db.runAsync(
    `UPDATE app_settings
     SET onboarding_completed_at = ?, updated_at = ?
     WHERE id = 'default'`,
    nowIso,
    nowIso,
  );
}

export async function resetOnboarding(db: SQLiteDatabase, nowIso = formatIsoTimestamp()) {
  await ensureSettingsRow(db, nowIso);
  await db.runAsync(
    `UPDATE app_settings
     SET onboarding_completed_at = NULL, updated_at = ?
     WHERE id = 'default'`,
    nowIso,
  );
}

async function ensureSettingsRow(db: SQLiteDatabase, nowIso = formatIsoTimestamp()) {
  await db.runAsync(
    `INSERT OR IGNORE INTO app_settings (id, onboarding_completed_at, week_starts_on, created_at, updated_at)
     VALUES ('default', NULL, 'monday', ?, ?)`,
    nowIso,
    nowIso,
  );
}

function mapSettingsRow(row: SettingsRow): AppSettings {
  return {
    onboardingCompletedAt: row.onboarding_completed_at ?? undefined,
    weekStartsOn: row.week_starts_on,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
