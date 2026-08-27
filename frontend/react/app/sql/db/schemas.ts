import * as SQLite from "expo-sqlite";
import { DB_SYNC_STATUS } from "../../constants/enum";
import { AMOUNT_MAX_VALUE } from "../../utils/amount";
import { LABEL_MAX_LEN as ACCOUNT_TYPE_LABEL_MAX_LEN } from "../../forms/schemas/accout_type.schema";
import {
  DESCRIPTION_MAX_LEN as ACCOUNT_DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN as ACCOUNT_LABEL_MAX_LEN,
} from "../../forms/schemas/account_management.schema";
import {
  DESCRIPTION_MAX_LEN as CATEGORY_DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN as CATEGORY_LABEL_MAX_LEN,
} from "../../forms/schemas/category_management.schema";
import { DESCRIPTION_MAX_LEN as TRANSACTION_DESCRIPTION_MAX_LEN } from "../../forms/schemas/transaction_management.schema";
import {
  EMAIL_MAX_LEN as ACCOUNT_SETTINGS_EMAIL_MAX_LEN,
  NICKNAME_MAX_LEN as ACCOUNT_SETTINGS_NICKNAME_MAX_LEN,
} from "../../forms/schemas/account_settings.schema";
import { DEFAULT_CURRENCY_CODE } from "../../constants/currencies";

export const createAccountSettingsTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS account_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      nickname VARCHAR(${ACCOUNT_SETTINGS_NICKNAME_MAX_LEN}) NOT NULL,
      email VARCHAR(${ACCOUNT_SETTINGS_EMAIL_MAX_LEN}) NOT NULL COLLATE NOCASE,
      language VARCHAR(10) NOT NULL
        CHECK (language IN ('en', 'zh-Hans', 'ms')),
      created_at DATETIME NOT NULL DEFAULT (datetime('now')),
      updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
    );
  `);
};

export const createCurrencyPreferencesTable = async (
  db: SQLite.SQLiteDatabase,
) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS currency_preferences (
      code CHAR(3) PRIMARY KEY COLLATE NOCASE,
      is_default BOOLEAN NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
      created_at DATETIME NOT NULL DEFAULT (datetime('now')),
      updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_currency_preferences_default
      ON currency_preferences(is_default)
      WHERE is_default = 1;

    INSERT OR IGNORE INTO currency_preferences (code, is_default)
    VALUES ('${DEFAULT_CURRENCY_CODE}', 1);
  `);
};

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
        currency_code CHAR(3) NOT NULL DEFAULT '${DEFAULT_CURRENCY_CODE}'
          CHECK (
            length(currency_code) = 3
            AND currency_code = upper(currency_code)
          ),
        label VARCHAR(${ACCOUNT_LABEL_MAX_LEN}) NOT NULL COLLATE NOCASE,
        descriptions VARCHAR(${ACCOUNT_DESCRIPTION_MAX_LEN}),
        current_balance REAL NOT NULL DEFAULT 0
          CHECK (
            ABS(current_balance) <= ${AMOUNT_MAX_VALUE}
            AND current_balance = ROUND(current_balance, 2)
          ),
        is_main_account BOOLEAN NOT NULL DEFAULT 0,

        is_active BOOLEAN NOT NULL DEFAULT 1,

        sync_status VARCHAR(20) NOT NULL DEFAULT ${DB_SYNC_STATUS.PENDING},
        synced_at DATETIME DEFAULT NULL,

        deleted_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME NOT NULL DEFAULT (datetime('now')),

        FOREIGN KEY (type_id) REFERENCES account_types(id)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_active_type_currency_label
        ON accounts(type_id, currency_code, label)
        WHERE deleted_at IS NULL;

      CREATE INDEX IF NOT EXISTS idx_accounts_active_currency
        ON accounts(currency_code)
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
        translation_key VARCHAR(${CATEGORY_LABEL_MAX_LEN}),
        sort_order INTEGER NOT NULL DEFAULT 0,

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

      CREATE INDEX IF NOT EXISTS idx_categories_active_type_sort_order
        ON categories(type_id, sort_order)
        WHERE deleted_at IS NULL;
    `);
};

export const createTransactionMgmtTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY, -- uuid

        transaction_type VARCHAR(20) NOT NULL
          CHECK (
            transaction_type IN ('income', 'expense', 'transfer', 'adjustment')
          ),

        category_id TEXT,
        account_id TEXT,
        from_account_id TEXT,
        to_account_id TEXT,

        amount REAL NOT NULL
          CHECK (
            ABS(amount) <= ${AMOUNT_MAX_VALUE}
            AND amount = ROUND(amount, 2)
          ),
        descriptions VARCHAR(${TRANSACTION_DESCRIPTION_MAX_LEN}),
        transaction_date DATE NOT NULL
          CHECK (
            date(transaction_date) IS NOT NULL
            AND transaction_date = date(transaction_date)
          ),

        is_active BOOLEAN NOT NULL DEFAULT 1,

        sync_status VARCHAR(20) NOT NULL DEFAULT '${DB_SYNC_STATUS.PENDING}',
        synced_at DATETIME DEFAULT NULL,

        deleted_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME NOT NULL DEFAULT (datetime('now')),

        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (account_id) REFERENCES accounts(id),
        FOREIGN KEY (from_account_id) REFERENCES accounts(id),
        FOREIGN KEY (to_account_id) REFERENCES accounts(id),

        CHECK (
          (
            transaction_type = 'adjustment'
            AND amount <> 0
          )
          OR
          (
            transaction_type IN ('income', 'expense', 'transfer')
            AND amount > 0
          )
        ),

        CHECK (
          (
            transaction_type IN ('income', 'expense')
            AND category_id IS NOT NULL
            AND account_id IS NOT NULL
            AND from_account_id IS NULL
            AND to_account_id IS NULL
          )
          OR
          (
            transaction_type = 'transfer'
            AND category_id IS NULL
            AND account_id IS NULL
            AND from_account_id IS NOT NULL
            AND to_account_id IS NOT NULL
            AND from_account_id <> to_account_id
          )
          OR
          (
            transaction_type = 'adjustment'
            AND category_id IS NULL
            AND account_id IS NOT NULL
            AND from_account_id IS NULL
            AND to_account_id IS NULL
          )
        )
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_active_date
        ON transactions(transaction_date DESC, created_at DESC)
        WHERE deleted_at IS NULL;

      CREATE INDEX IF NOT EXISTS idx_transactions_active_account
        ON transactions(account_id)
        WHERE deleted_at IS NULL;

      CREATE INDEX IF NOT EXISTS idx_transactions_active_from_account
        ON transactions(from_account_id)
        WHERE deleted_at IS NULL;

      CREATE INDEX IF NOT EXISTS idx_transactions_active_to_account
        ON transactions(to_account_id)
        WHERE deleted_at IS NULL;
    `);
};

export const createBudgetTables = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
      CREATE TABLE IF NOT EXISTS budget_plans (
        id TEXT PRIMARY KEY,
        currency_code CHAR(3) NOT NULL COLLATE NOCASE
          CHECK (
            length(currency_code) = 3
            AND currency_code = upper(currency_code)
          ),

        sync_status VARCHAR(20) NOT NULL DEFAULT '${DB_SYNC_STATUS.PENDING}',
        synced_at DATETIME DEFAULT NULL,
        deleted_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_budget_plans_active_currency
        ON budget_plans(currency_code)
        WHERE deleted_at IS NULL;

      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL,
        month DATE NOT NULL
          CHECK (
            date(month) IS NOT NULL
            AND month = date(month, 'start of month')
          ),
        total_budget REAL NOT NULL
          CHECK (
            total_budget > 0
            AND total_budget <= ${AMOUNT_MAX_VALUE}
            AND total_budget = ROUND(total_budget, 2)
          ),
        is_active BOOLEAN NOT NULL DEFAULT 1,

        sync_status VARCHAR(20) NOT NULL DEFAULT '${DB_SYNC_STATUS.PENDING}',
        synced_at DATETIME DEFAULT NULL,
        deleted_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME NOT NULL DEFAULT (datetime('now')),

        FOREIGN KEY (plan_id) REFERENCES budget_plans(id)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_active_plan_month
        ON budgets(plan_id, month)
        WHERE deleted_at IS NULL;

      CREATE INDEX IF NOT EXISTS idx_budgets_active_month
        ON budgets(month)
        WHERE deleted_at IS NULL;

      CREATE TABLE IF NOT EXISTS budget_categories (
        id TEXT PRIMARY KEY,
        budget_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        amount REAL NOT NULL
          CHECK (
            amount > 0
            AND amount <= ${AMOUNT_MAX_VALUE}
            AND amount = ROUND(amount, 2)
          ),

        sync_status VARCHAR(20) NOT NULL DEFAULT '${DB_SYNC_STATUS.PENDING}',
        synced_at DATETIME DEFAULT NULL,
        deleted_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME NOT NULL DEFAULT (datetime('now')),

        FOREIGN KEY (budget_id) REFERENCES budgets(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_budget_categories_active_budget_category
        ON budget_categories(budget_id, category_id)
        WHERE deleted_at IS NULL;

      CREATE INDEX IF NOT EXISTS idx_budget_categories_active_budget
        ON budget_categories(budget_id)
        WHERE deleted_at IS NULL;

      CREATE INDEX IF NOT EXISTS idx_transactions_active_category_date
        ON transactions(category_id, transaction_date)
        WHERE deleted_at IS NULL;
    `);
};
