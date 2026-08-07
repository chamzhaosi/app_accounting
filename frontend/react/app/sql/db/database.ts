import * as SQLite from "expo-sqlite";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { runMigrations } from "./migrations";
import { getOrCreateDBKey } from "./common";

let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<void> | null = null;

export const getDB = async () => {
  if (db) return db;

  if (!dbPromise) {
    debugLog(DEBUG_TAG.DATABASE, "Opening database");
    dbPromise = SQLite.openDatabaseAsync("finora-db")
      .then((openedDB) => {
        db = openedDB;
        debugLog(DEBUG_TAG.DATABASE, "Database opened");
        return openedDB;
      })
      .catch((error) => {
        dbPromise = null;
        throw error;
      });
  }

  return dbPromise;
};

export const initDB = async () => {
  if (!initPromise) {
    initPromise = initializeDatabase().catch((error) => {
      initPromise = null;
      console.error(
        DEBUG_TAG.DATABASE,
        "Database initialization failed",
        error,
      );
      throw error;
    });
  }

  return initPromise;
};

const initializeDatabase = async () => {
  debugLog(DEBUG_TAG.DATABASE, "Starting database initialization");
  const openedDB = await getDB();

  await initDBSetup(openedDB);
  debugLog(DEBUG_TAG.DATABASE, "Database setup complete");

  debugLog(DEBUG_TAG.DATABASE, "Running database migrations");
  await runMigrations(openedDB);
  debugLog(DEBUG_TAG.DATABASE, "Database ready");
};

const initDBSetup = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`PRAGMA journal_mode = WAL`);

  const dbKey = await getOrCreateDBKey();
  await db.execAsync(`PRAGMA key = '${dbKey}'`);
  await db.execAsync("PRAGMA foreign_keys = ON");
};
