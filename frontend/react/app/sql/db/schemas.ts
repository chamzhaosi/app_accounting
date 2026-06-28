import * as SQLite from "expo-sqlite";
import { LABEL_MAX_LEN } from "../../forms/schemas/category_management.schema";
import { DB_SYNC_STATUS } from "../../constants/enum";

export const createAccTypTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
      CREATE TABLE IF NOT EXISTS account_types (
        id TEXT PRIMARY KEY, -- uuid
        
        label VARCHAR(${LABEL_MAX_LEN}) NOT NULL COLLATE NOCASE UNIQUE,
        icon VARCHAR(100) NOT NULL,

        is_active BOOLEAN NOT NULL DEFAULT 1,
        is_system BOOLEAN NOT NULL DEFAULT 0,

        sync_status VARCHAR(20) NOT NULL DEFAULT ${DB_SYNC_STATUS.PENDING},
        synced_at DATETIME DEFAULT NULL,

        deleted_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
      );
    `);
};
