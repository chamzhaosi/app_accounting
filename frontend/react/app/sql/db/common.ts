import * as SQLite from "expo-sqlite";
import { DB_KEY, getStoredItem, setStoredItem } from "../../local/secureStore";
import * as Crypto from "expo-crypto";

export const checkCurrentDBVersion = async (db: SQLite.SQLiteDatabase) => {
  return await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
};

export const updateDBVersion = async (
  db: SQLite.SQLiteDatabase,
  vrs: number,
) => {
  await db.execAsync(`PRAGMA user_version = ${vrs};`);
};

export const getOrCreateDBKey = async () => {
  try {
    let dbKey = await getStoredItem(DB_KEY);
    if (!dbKey) {
      dbKey = Crypto.randomUUID();
      await setStoredItem(DB_KEY, dbKey);
    }

    return dbKey;
  } catch (e) {
    console.error("Error when getting or creating db key", e);
  }
};
