// database.ts
import * as SQLite from 'expo-sqlite';

export type SettingKey =
  | 'darkMode'
  | 'noteLang'
  | 'tuning'
  | 'handedness'
  | 'guitarType';

export interface SettingsRow {
  key: string;
  value: string;
}

let db: SQLite.SQLiteDatabase;

/**
 * Ініціалізує базу даних та створює таблицю settings,
 * якщо вона ще не існує. Потім «посіває» дефолтні
 * значення при першому запуску.
 */
export async function initDatabase(): Promise<void> {
  console.log('[DB] initDatabase - opening database');
  db = await SQLite.openDatabaseAsync('tuner.db');

  console.log('[DB] initDatabase - ensuring settings table exists');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  console.log('[DB] initDatabase - adding guitarType column if missing');
  await db.execAsync(`
    ALTER TABLE settings ADD COLUMN guitarType TEXT DEFAULT 'six';
  `).catch(() => {
    console.log('[DB] initDatabase - guitarType column already exists');
  });

  const countRow = await db.getFirstAsync<{ cnt: number }>(
    `SELECT COUNT(*) AS cnt FROM settings;`
  );
  console.log('[DB] initDatabase - current settings count:', countRow?.cnt);
  if (countRow?.cnt === 0) {
    console.log('[DB] initDatabase - inserting default settings');
    await db.execAsync(`
      INSERT INTO settings (key, value) VALUES
        ('darkMode', 'false'),
        ('noteLang', 'uk'),
        ('tuning', 'standard'),
        ('handedness', 'right'),
        ('guitarType', 'six');
    `);
  }
}

/**
 * Повертає значення одного налаштування за ключем.
 */
export async function getSetting(
  key: SettingKey
): Promise<string | null> {
  if (!db) throw new Error('Database not initialized');
  console.log('[DB] getSetting - key:', key);
  const row = await db.getFirstAsync<SettingsRow>(
    `SELECT value FROM settings WHERE key = ?;`,
    key
  );
  const value = row ? row.value : null;
  console.log('[DB] getSetting - result:', value);
  return value;
}

/**
 * Оновлює або вставляє (UPSERT) налаштування.
 */
export async function setSetting(
  key: SettingKey,
  value: string
): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  console.log('[DB] setSetting - key:', key, 'value:', value);
  await db.runAsync(
    `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);`,
    key,
    value
  );
  console.log('[DB] setSetting - saved');
}

/**
 * Завантажує всі налаштування у вигляді об’єкта.
 */
export async function getAllSettings(): Promise<Record<SettingKey, string>> {
  if (!db) throw new Error('Database not initialized');
  console.log('[DB] getAllSettings - fetching all settings');
  const rows = await db.getAllAsync<SettingsRow>(
    `SELECT key, value FROM settings;`
  );
  const result = {} as Record<SettingKey, string>;
  for (const { key, value } of rows) {
    result[key as SettingKey] = value;
  }
  console.log('[DB] getAllSettings - result:', result);
  return result;
}

// optional: закриття БД
export async function closeDatabase(): Promise<void> {
  console.log('[DB] closeDatabase - closing database');
  await db.closeAsync();
  console.log('[DB] closeDatabase - closed');
}
