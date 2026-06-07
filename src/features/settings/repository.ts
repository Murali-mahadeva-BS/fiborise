import { type SQLiteDatabase } from "expo-sqlite";

import { formatIsoTimestamp } from "@/lib/dates";

import { AppSettings, ThemePreference } from "../habits/types";

type SettingsRow = {
  week_starts_on: "monday";
  theme_preference: ThemePreference;
  created_at: string;
  updated_at: string;
};

export async function getAppSettings(db: SQLiteDatabase): Promise<AppSettings> {
  await ensureSettingsRow(db);
  const row = await db.getFirstAsync<SettingsRow>(
    `SELECT week_starts_on, theme_preference, created_at, updated_at
     FROM app_settings
     WHERE id = 'default'`,
  );

  if (!row) {
    throw new Error("App settings could not be loaded");
  }

  return mapSettingsRow(row);
}

export async function updateThemePreference(
  db: SQLiteDatabase,
  themePreference: ThemePreference,
  nowIso = formatIsoTimestamp(),
) {
  await ensureSettingsRow(db, nowIso);
  await db.runAsync(
    `UPDATE app_settings
     SET theme_preference = ?, updated_at = ?
     WHERE id = 'default'`,
    themePreference,
    nowIso,
  );
}

async function ensureSettingsRow(
  db: SQLiteDatabase,
  nowIso = formatIsoTimestamp(),
) {
  await db.runAsync(
    `INSERT OR IGNORE INTO app_settings (id, onboarding_completed_at, week_starts_on, theme_preference, created_at, updated_at)
     VALUES ('default', NULL, 'monday', 'system', ?, ?)`,
    nowIso,
    nowIso,
  );
}

function mapSettingsRow(row: SettingsRow): AppSettings {
  return {
    weekStartsOn: row.week_starts_on,
    themePreference: row.theme_preference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
