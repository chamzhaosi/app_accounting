import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migrations";
import { getOrCreateDBKey } from "./common";

let db: SQLite.SQLiteDatabase | null = null;

export const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("finora-db");
  }

  return db;
};

export const initDB = async () => {
  try {
    const db = await getDB();
    await initDBSetup(db);
    await runMigrations(db);
  } catch (e) {
    console.error("Error when initial DB", e);
  }
};

const initDBSetup = async (db: SQLite.SQLiteDatabase) => {
  try {
    await db.execAsync(`PRAGMA journal_mode = WAL`);

    const dbKey = await getOrCreateDBKey();
    console.log(dbKey);
    await db.execAsync(`PRAGMA key = '${12312313123123}'`);
  } catch (e) {
    console.error("Error when setup DB", e);
  }
};
