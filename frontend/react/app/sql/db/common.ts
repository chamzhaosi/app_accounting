import * as Crypto from "expo-crypto";
import * as SQLite from "expo-sqlite";
import { DB_KEY, getStoredItem, setStoredItem } from "../../local/secureStore";
import { DEBUG_TAG } from "../../utils/debugLog";
import { OrderBy } from "../types/common";

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_CURRENT_PAGE = 1;

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
    console.error(
      DEBUG_TAG.DATABASE,
      "Unable to get or create database key",
      e,
    );
    throw e;
  }
};

export const buildOrderBy = (orderBy?: OrderBy | OrderBy[]) => {
  if (!orderBy) {
    return "ORDER BY id DESC";
  }

  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];

  return (
    "ORDER BY " +
    orders
      .map(({ column, direction = "ASC" }) => `${column} ${direction}`)
      .join(", ")
  );
};
