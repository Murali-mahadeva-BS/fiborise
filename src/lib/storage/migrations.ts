import { type SQLiteDatabase } from 'expo-sqlite';

const migrations = [
  {
    version: 1,
    name: 'initial_local_first_schema',
    sql: `
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        description TEXT,
        base_amount REAL NOT NULL CHECK (base_amount > 0),
        unit TEXT NOT NULL,
        start_date TEXT NOT NULL,
        reminder_enabled INTEGER NOT NULL DEFAULT 0,
        reminder_time TEXT,
        stay_mode_enabled INTEGER NOT NULL DEFAULT 0,
        stay_mode_level_sequence_position INTEGER,
        stay_mode_level INTEGER,
        stay_mode_target_amount REAL,
        stay_mode_done_days_in_level INTEGER,
        archived_at TEXT,
        deleted_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS habit_logs (
        id TEXT PRIMARY KEY NOT NULL,
        habit_id TEXT NOT NULL,
        local_date TEXT NOT NULL,
        level_sequence_position INTEGER NOT NULL,
        level INTEGER NOT NULL,
        planned_amount REAL NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
        UNIQUE (habit_id, local_date)
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        id TEXT PRIMARY KEY NOT NULL CHECK (id = 'default'),
        onboarding_completed_at TEXT,
        week_starts_on TEXT NOT NULL DEFAULT 'monday',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_habits_active_creation
        ON habits (deleted_at, archived_at, created_at);

      CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date
        ON habit_logs (habit_id, local_date);
    `,
  },
];

type MigrationVersionRow = {
  version: number | null;
};

export async function migrateDb(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const versionRow = await db.getFirstAsync<MigrationVersionRow>(
    'SELECT MAX(version) AS version FROM schema_migrations',
  );
  const currentVersion = versionRow?.version ?? 0;

  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue;
    }

    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.sql);
      await db.runAsync(
        `INSERT INTO schema_migrations (version, name, applied_at)
         VALUES (?, ?, ?)`,
        migration.version,
        migration.name,
        new Date().toISOString(),
      );
    });
  }
}
