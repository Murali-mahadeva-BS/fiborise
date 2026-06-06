import { type SQLiteDatabase } from 'expo-sqlite';

import { migrateDb } from './migrations';

export const databaseName = 'fiborise.db';

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await migrateDb(db);
}
