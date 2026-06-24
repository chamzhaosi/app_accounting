import * as SQLite from "expo-sqlite";

export const createAccTypTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
      CREATE TABLE IF NOT EXISTS account_types (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL
      );
    `);
};
