import * as SQLite from 'expo-sqlite';

export async function init() {
  const db = await SQLite.openDatabaseAsync('GameShowcase.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY NOT NULL,           -- bigint → sqlite INTEGER PK
      Name TEXT,                                 -- text
      Started TEXT,                              -- text
      Finished TEXT,                             -- text
      Rating INTEGER,                            -- bigint → INTEGER
      Status TEXT,                               -- enum → TEXT (you can add CHECK below)
      "Developer/Publisher" TEXT,                -- text with slash, so quoted
      Platform TEXT,                             -- enum → TEXT
      Playtime TEXT,                             -- text
      Bought TEXT,                               -- text
      Cost TEXT,                                 -- text
      Comments TEXT                              -- text
    );
  `);
}