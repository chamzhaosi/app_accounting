import * as SQLite from "expo-sqlite";
import { DB_SYNC_STATUS } from "../../constants/enum";
import { LABEL_MAX_LEN as ACCOUNT_TYPE_LABEL_MAX_LEN } from "../../forms/schemas/accout_type.schema";
import {
  DESCRIPTION_MAX_LEN as ACCOUNT_DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN as ACCOUNT_LABEL_MAX_LEN,
} from "../../forms/schemas/account_management.schema";
import {
  DESCRIPTION_MAX_LEN as CATEGORY_DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN as CATEGORY_LABEL_MAX_LEN,
} from "../../forms/schemas/category_management.schema";

export const createAccTypTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
      CREATE TABLE IF NOT EXISTS account_types (
        id TEXT PRIMARY KEY, -- uuid
        
        label VARCHAR(${ACCOUNT_TYPE_LABEL_MAX_LEN}) NOT NULL COLLATE NOCASE,
        icon VARCHAR(100) NOT NULL,

        is_active BOOLEAN NOT NULL DEFAULT 1,
        is_system BOOLEAN NOT NULL DEFAULT 0,

        sync_status VARCHAR(20) NOT NULL DEFAULT ${DB_SYNC_STATUS.PENDING},
        synced_at DATETIME DEFAULT NULL,

        deleted_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_account_types_active_label
        ON account_types(label)
        WHERE deleted_at IS NULL;
    `);
};

export const createAccMgmtTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY, -- uuid

        type_id TEXT NOT NULL,
        label VARCHAR(${ACCOUNT_LABEL_MAX_LEN}) NOT NULL COLLATE NOCASE,
        descriptions VARCHAR(${ACCOUNT_DESCRIPTION_MAX_LEN}),
        initial_value REAL NOT NULL DEFAULT 0,
        is_main_account BOOLEAN NOT NULL DEFAULT 0,

        is_active BOOLEAN NOT NULL DEFAULT 1,

        sync_status VARCHAR(20) NOT NULL DEFAULT ${DB_SYNC_STATUS.PENDING},
        synced_at DATETIME DEFAULT NULL,

        deleted_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME NOT NULL DEFAULT (datetime('now')),

        FOREIGN KEY (type_id) REFERENCES account_types(id)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_active_type_label
        ON accounts(type_id, label)
        WHERE deleted_at IS NULL;
  `);
};

export const createCategoryMgmtTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY, -- uuid

        type_id INTEGER NOT NULL CHECK (type_id IN (1, 2)),
        label VARCHAR(${CATEGORY_LABEL_MAX_LEN}) NOT NULL COLLATE NOCASE,
        icon VARCHAR(100) NOT NULL,
        descriptions VARCHAR(${CATEGORY_DESCRIPTION_MAX_LEN}),

        is_active BOOLEAN NOT NULL DEFAULT 1,
        is_system BOOLEAN NOT NULL DEFAULT 0,

        sync_status VARCHAR(20) NOT NULL DEFAULT ${DB_SYNC_STATUS.PENDING},
        synced_at DATETIME DEFAULT NULL,

        deleted_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_active_type_label
        ON categories(type_id, label)
        WHERE deleted_at IS NULL;
    `);
};
