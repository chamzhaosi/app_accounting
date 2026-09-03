import { checkCurrentDBVersion, updateDBVersion } from "./common";
import * as SQLite from "expo-sqlite";
import {
  createAccMgmtTable,
  createAccountSettingsTable,
  createAccTypTable,
  createBudgetTables,
  createCategoryMgmtTable,
  createCurrencyPreferencesTable,
  createCreditCardTables,
  createTransactionMgmtTable,
  createTransactionAttachmentTable,
} from "./schemas";
import { insertAccTypTable, insertCategoryMgmtTable } from "./seed";
import { randomUUID } from "expo-crypto";

const addSeededCategoryTranslationKeys = async (db: SQLite.SQLiteDatabase) => {
  const columns = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(categories);",
  );

  if (!columns.some(({ name }) => name === "translation_key")) {
    await db.execAsync(
      "ALTER TABLE categories ADD COLUMN translation_key VARCHAR(30);",
    );
  }

  await db.execAsync(`
    UPDATE categories
    SET
      is_system = 0,
      translation_key = label
    WHERE deleted_at IS NULL
      AND (
        (type_id = 1 AND label = 'Salary' AND icon = 'Briefcase')
        OR (type_id = 1 AND label = 'Allowance' AND icon = 'HandCoins')
        OR (type_id = 1 AND label = 'Bonus' AND icon = 'Gift')
        OR (type_id = 1 AND label = 'Freelance' AND icon = 'Laptop')
        OR (type_id = 1 AND label = 'Investment' AND icon = 'TrendingUp')
        OR (type_id = 1 AND label = 'Refund' AND icon = 'RotateCcw')
        OR (type_id = 2 AND label = 'Meals' AND icon = 'Utensils')
        OR (type_id = 2 AND label = 'Grocery' AND icon = 'ShoppingBasket')
        OR (type_id = 2 AND label = 'Transport' AND icon = 'Car')
        OR (type_id = 2 AND label = 'Housing' AND icon = 'House')
        OR (type_id = 2 AND label = 'Utilities' AND icon = 'Lightbulb')
        OR (type_id = 2 AND label = 'Bills' AND icon = 'Receipt')
        OR (type_id = 2 AND label = 'Shopping' AND icon = 'ShoppingBag')
        OR (type_id = 2 AND label = 'Medical' AND icon = 'HeartPulse')
        OR (type_id = 2 AND label = 'Education' AND icon = 'GraduationCap')
        OR (type_id = 2 AND label = 'Entertainment' AND icon = 'Gamepad2')
        OR (type_id = 2 AND label = 'Insurance' AND icon = 'Shield')
        OR (type_id = 2 AND label = 'Travel' AND icon = 'Plane')
        OR (type_id = 2 AND label = 'Fees & Charges' AND icon = 'BadgeDollarSign')
        OR (type_id = 2 AND label = 'Other Expense' AND icon = 'CircleEllipsis')
      );
  `);
};

const migrateCurrencyAmountPrecision = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    DROP INDEX IF EXISTS idx_accounts_active_type_currency_label;
    DROP INDEX IF EXISTS idx_accounts_active_currency;
    DROP INDEX IF EXISTS idx_transactions_active_date;
    DROP INDEX IF EXISTS idx_transactions_active_account;
    DROP INDEX IF EXISTS idx_transactions_active_from_account;
    DROP INDEX IF EXISTS idx_transactions_active_to_account;
    DROP INDEX IF EXISTS idx_transactions_active_operation;
    DROP INDEX IF EXISTS idx_transactions_active_exchange_pair_date;
    DROP INDEX IF EXISTS idx_transactions_active_category_date;
    DROP INDEX IF EXISTS idx_budgets_active_plan_month;
    DROP INDEX IF EXISTS idx_budgets_active_month;
    DROP INDEX IF EXISTS idx_budget_categories_active_budget_category;
    DROP INDEX IF EXISTS idx_budget_categories_active_budget;

    ALTER TABLE accounts RENAME TO accounts_precision_v12;
    ALTER TABLE transactions RENAME TO transactions_precision_v12;
    ALTER TABLE budgets RENAME TO budgets_precision_v12;
    ALTER TABLE budget_categories RENAME TO budget_categories_precision_v12;
  `);

  await createAccMgmtTable(db);
  await createTransactionMgmtTable(db);
  await createBudgetTables(db);

  await db.execAsync(`
    INSERT INTO accounts (
      id, type_id, currency_code, label, descriptions, current_balance,
      is_active, sync_status, synced_at, deleted_at,
      created_at, updated_at
    )
    SELECT
      id, type_id, currency_code, label, descriptions, current_balance,
      is_active, sync_status, synced_at, deleted_at,
      created_at, updated_at
    FROM accounts_precision_v12;

    INSERT INTO transactions (
      id, transaction_type, category_id, account_id, from_account_id,
      to_account_id, operation_id, transaction_role, amount, currency_code,
      account_currency_code, converted_amount, exchange_rate,
      exchange_rate_source, exchange_rate_source_transaction_id, descriptions,
      transaction_date, is_active, sync_status, synced_at, deleted_at,
      created_at, updated_at
    )
    SELECT
      id, transaction_type, category_id, account_id, from_account_id,
      to_account_id, operation_id, transaction_role, amount, currency_code,
      account_currency_code, converted_amount, exchange_rate,
      exchange_rate_source, exchange_rate_source_transaction_id, descriptions,
      transaction_date, is_active, sync_status, synced_at, deleted_at,
      created_at, updated_at
    FROM transactions_precision_v12;

    INSERT INTO budgets (
      id, plan_id, month, total_budget, is_active, sync_status, synced_at,
      deleted_at, created_at, updated_at
    )
    SELECT
      id, plan_id, month, total_budget, is_active, sync_status, synced_at,
      deleted_at, created_at, updated_at
    FROM budgets_precision_v12;

    INSERT INTO budget_categories (
      id, budget_id, category_id, amount, sync_status, synced_at, deleted_at,
      created_at, updated_at
    )
    SELECT
      id, budget_id, category_id, amount, sync_status, synced_at, deleted_at,
      created_at, updated_at
    FROM budget_categories_precision_v12;

    DROP TABLE budget_categories_precision_v12;
    DROP TABLE budgets_precision_v12;
    DROP TABLE transactions_precision_v12;
    DROP TABLE accounts_precision_v12;
  `);
};

export const runMigrations = async (db: SQLite.SQLiteDatabase) => {
  const currentVersion = (await checkCurrentDBVersion(db))?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.withTransactionAsync(async () => {
      await createAccTypTable(db);
      await createAccMgmtTable(db);
      await createCategoryMgmtTable(db);
      await createTransactionMgmtTable(db);
      await insertAccTypTable(db);
      await insertCategoryMgmtTable(db);
      await updateDBVersion(db, 1);
    });
  }

  if (currentVersion < 2) {
    await db.withTransactionAsync(async () => {
      await createBudgetTables(db);
      await updateDBVersion(db, 2);
    });
  }

  if (currentVersion < 3) {
    await db.withTransactionAsync(async () => {
      const columns = await db.getAllAsync<{ name: string }>(
        "PRAGMA table_info(categories);",
      );

      if (!columns.some(({ name }) => name === "sort_order")) {
        await db.execAsync(
          "ALTER TABLE categories ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;",
        );
      }

      await db.execAsync(`
        WITH ranked_categories AS (
          SELECT
            id,
            ROW_NUMBER() OVER (
              PARTITION BY type_id
              ORDER BY created_at ASC, label ASC
            ) - 1 AS position
          FROM categories
          WHERE deleted_at IS NULL
        )
        UPDATE categories
        SET sort_order = (
          SELECT position
          FROM ranked_categories
          WHERE ranked_categories.id = categories.id
        )
        WHERE deleted_at IS NULL;

        CREATE INDEX IF NOT EXISTS idx_categories_active_type_sort_order
          ON categories(type_id, sort_order)
          WHERE deleted_at IS NULL;
      `);
      await updateDBVersion(db, 3);
    });
  }

  if (currentVersion < 4) {
    await db.withTransactionAsync(async () => {
      await createAccountSettingsTable(db);
      await updateDBVersion(db, 4);
    });
  }

  if (currentVersion < 5) {
    await db.withTransactionAsync(async () => {
      await addSeededCategoryTranslationKeys(db);
      await updateDBVersion(db, 5);
    });
  }

  if (currentVersion < 6) {
    await db.withTransactionAsync(async () => {
      await addSeededCategoryTranslationKeys(db);
      await updateDBVersion(db, 6);
    });
  }

  if (currentVersion < 7) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        UPDATE accounts
        SET current_balance = ROUND(current_balance, 2);

        UPDATE transactions
        SET amount = ROUND(amount, 2);

        UPDATE budgets
        SET total_budget = ROUND(total_budget, 2);

        UPDATE budget_categories
        SET amount = ROUND(amount, 2);
      `);
      await updateDBVersion(db, 7);
    });
  }

  if (currentVersion < 8) {
    await db.withTransactionAsync(async () => {
      await createCurrencyPreferencesTable(db);
      await updateDBVersion(db, 8);
    });
  }

  if (currentVersion < 9) {
    await db.withTransactionAsync(async () => {
      const columns = await db.getAllAsync<{ name: string }>(
        "PRAGMA table_info(accounts);",
      );

      if (!columns.some(({ name }) => name === "currency_code")) {
        await db.execAsync(`
          ALTER TABLE accounts
          ADD COLUMN currency_code CHAR(3) NOT NULL DEFAULT 'MYR'
            CHECK (
              length(currency_code) = 3
              AND currency_code = upper(currency_code)
            );
        `);
      }

      await db.execAsync(`
        UPDATE accounts
        SET currency_code = COALESCE(
          (
            SELECT code
            FROM currency_preferences
            WHERE is_default = 1
            LIMIT 1
          ),
          'MYR'
        );

        CREATE INDEX IF NOT EXISTS idx_accounts_active_currency
          ON accounts(currency_code)
          WHERE deleted_at IS NULL;
      `);
      await updateDBVersion(db, 9);
    });
  }

  if (currentVersion < 10) {
    await db.withTransactionAsync(async () => {
      const budgetColumns = await db.getAllAsync<{ name: string }>(
        "PRAGMA table_info(budgets);",
      );

      if (!budgetColumns.some(({ name }) => name === "plan_id")) {
        const existingBudgetCount = await db.getFirstAsync<{ count: number }>(
          "SELECT COUNT(*) AS count FROM budgets;",
        );
        const legacyPlanId = randomUUID();

        await db.execAsync(`
          ALTER TABLE budget_categories RENAME TO budget_categories_legacy;
          ALTER TABLE budgets RENAME TO budgets_legacy;

          DROP INDEX IF EXISTS idx_budget_categories_active_budget_category;
          DROP INDEX IF EXISTS idx_budget_categories_active_budget;
          DROP INDEX IF EXISTS idx_budgets_active_month;
        `);

        await createBudgetTables(db);

        if ((existingBudgetCount?.count ?? 0) > 0) {
          const defaultCurrency = await db.getFirstAsync<{ code: string }>(
            `SELECT code
             FROM currency_preferences
             WHERE is_default = 1
             LIMIT 1;`,
          );

          await db.runAsync(
            `INSERT INTO budget_plans (id, currency_code)
             VALUES (?, ?);`,
            [legacyPlanId, defaultCurrency?.code ?? "MYR"],
          );
          await db.runAsync(
            `INSERT INTO budgets (
               id, plan_id, month, total_budget, is_active,
               sync_status, synced_at, deleted_at, created_at, updated_at
             )
             SELECT
               id, ?, month, total_budget, is_active,
               sync_status, synced_at, deleted_at, created_at, updated_at
             FROM budgets_legacy;`,
            [legacyPlanId],
          );
          await db.execAsync(`
            INSERT INTO budget_categories (
              id, budget_id, category_id, amount,
              sync_status, synced_at, deleted_at, created_at, updated_at
            )
            SELECT
              id, budget_id, category_id, amount,
              sync_status, synced_at, deleted_at, created_at, updated_at
            FROM budget_categories_legacy;
          `);
        }

        await db.execAsync(`
          DROP TABLE budget_categories_legacy;
          DROP TABLE budgets_legacy;
        `);
      } else {
        await createBudgetTables(db);
      }

      await updateDBVersion(db, 10);
    });
  }

  if (currentVersion < 11) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        DROP INDEX IF EXISTS idx_accounts_active_type_label;

        CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_active_type_currency_label
          ON accounts(type_id, currency_code, label)
          WHERE deleted_at IS NULL;
      `);
      await updateDBVersion(db, 11);
    });
  }

  if (currentVersion < 12) {
    await db.withTransactionAsync(async () => {
      const columns = await db.getAllAsync<{ name: string }>(
        "PRAGMA table_info(transactions);",
      );
      const columnNames = new Set(columns.map(({ name }) => name));

      if (!columnNames.has("operation_id")) {
        await db.execAsync(
          "ALTER TABLE transactions ADD COLUMN operation_id TEXT;",
        );
      }
      if (!columnNames.has("transaction_role")) {
        await db.execAsync(
          "ALTER TABLE transactions ADD COLUMN transaction_role VARCHAR(10) NOT NULL DEFAULT 'main' CHECK (transaction_role IN ('main', 'fee'));",
        );
      }
      if (!columnNames.has("currency_code")) {
        await db.execAsync(
          "ALTER TABLE transactions ADD COLUMN currency_code CHAR(3);",
        );
      }
      if (!columnNames.has("account_currency_code")) {
        await db.execAsync(
          "ALTER TABLE transactions ADD COLUMN account_currency_code CHAR(3);",
        );
      }
      if (!columnNames.has("converted_amount")) {
        await db.execAsync(
          "ALTER TABLE transactions ADD COLUMN converted_amount REAL;",
        );
      }
      if (!columnNames.has("exchange_rate")) {
        await db.execAsync(
          "ALTER TABLE transactions ADD COLUMN exchange_rate REAL;",
        );
      }
      if (!columnNames.has("exchange_rate_source")) {
        await db.execAsync(
          "ALTER TABLE transactions ADD COLUMN exchange_rate_source VARCHAR(20);",
        );
      }
      if (!columnNames.has("exchange_rate_source_transaction_id")) {
        await db.execAsync(
          "ALTER TABLE transactions ADD COLUMN exchange_rate_source_transaction_id TEXT;",
        );
      }

      await db.execAsync(`
        UPDATE transactions
        SET
          operation_id = COALESCE(operation_id, id),
          transaction_role = COALESCE(transaction_role, 'main'),
          currency_code = COALESCE(
            currency_code,
            CASE
              WHEN transaction_type = 'transfer' THEN (
                SELECT currency_code FROM accounts WHERE id = from_account_id
              )
              ELSE (
                SELECT currency_code FROM accounts WHERE id = account_id
              )
            END,
            'MYR'
          ),
          account_currency_code = COALESCE(
            account_currency_code,
            CASE
              WHEN transaction_type = 'transfer' THEN (
                SELECT currency_code FROM accounts WHERE id = to_account_id
              )
              ELSE (
                SELECT currency_code FROM accounts WHERE id = account_id
              )
            END,
            'MYR'
          ),
          converted_amount = COALESCE(converted_amount, amount),
          exchange_rate = CASE
            WHEN transaction_type = 'transfer'
              AND COALESCE(
                (SELECT currency_code FROM accounts WHERE id = from_account_id),
                'MYR'
              ) <> COALESCE(
                (SELECT currency_code FROM accounts WHERE id = to_account_id),
                'MYR'
              )
            THEN COALESCE(exchange_rate, 1)
            ELSE exchange_rate
          END,
          exchange_rate_source = CASE
            WHEN transaction_type = 'transfer'
              AND COALESCE(
                (SELECT currency_code FROM accounts WHERE id = from_account_id),
                'MYR'
              ) <> COALESCE(
                (SELECT currency_code FROM accounts WHERE id = to_account_id),
                'MYR'
              )
            THEN COALESCE(exchange_rate_source, 'manual')
            ELSE exchange_rate_source
          END;

        INSERT OR IGNORE INTO categories (
          id, type_id, label, icon, descriptions, translation_key, is_system
        ) VALUES (
          lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
          substr(lower(hex(randomblob(2))), 2) || '-' ||
          substr('89ab', abs(random()) % 4 + 1, 1) ||
          substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
          2,
          'Fees & Charges',
          'BadgeDollarSign',
          'Bank, card, platform, and service fees',
          'Fees & Charges',
          1
        );

        UPDATE categories
        SET
          translation_key = 'Fees & Charges',
          is_system = 1
        WHERE type_id = 2
          AND label = 'Fees & Charges' COLLATE NOCASE
          AND deleted_at IS NULL;

        CREATE INDEX IF NOT EXISTS idx_transactions_active_operation
          ON transactions(operation_id, transaction_role)
          WHERE deleted_at IS NULL;

        CREATE INDEX IF NOT EXISTS idx_transactions_active_exchange_pair_date
          ON transactions(currency_code, account_currency_code, transaction_date DESC)
          WHERE deleted_at IS NULL AND exchange_rate IS NOT NULL;
      `);
      await updateDBVersion(db, 12);
    });
  }

  if (currentVersion < 13) {
    await db.execAsync("PRAGMA foreign_keys = OFF;");
    try {
      await db.withTransactionAsync(async () => {
        await migrateCurrencyAmountPrecision(db);
        await updateDBVersion(db, 13);
      });
    } finally {
      await db.execAsync("PRAGMA foreign_keys = ON;");
    }
  }

  if (currentVersion < 14) {
    await db.withTransactionAsync(async () => {
      const columns = await db.getAllAsync<{ name: string }>(
        "PRAGMA table_info(accounts);",
      );
      if (!columns.some(({ name }) => name === "is_asset")) {
        await db.execAsync(
          "ALTER TABLE accounts ADD COLUMN is_asset BOOLEAN NOT NULL DEFAULT 1 CHECK (is_asset IN (0, 1));",
        );
      }
      if (columns.some(({ name }) => name === "is_main_account")) {
        await db.execAsync("ALTER TABLE accounts DROP COLUMN is_main_account;");
      }
      await updateDBVersion(db, 14);
    });
  }

  if (currentVersion < 15) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        UPDATE account_types
        SET label = label || ' (Custom)', updated_at = datetime('now')
        WHERE is_system = 0
          AND label IN ('Credit Card', 'Debit Card') COLLATE NOCASE
          AND deleted_at IS NULL;

        UPDATE account_types
        SET label = 'Credit Card', updated_at = datetime('now')
        WHERE label = 'Card' COLLATE NOCASE AND is_system = 1 AND deleted_at IS NULL;

        INSERT INTO account_types (id, label, icon, is_system)
        SELECT lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
          substr(lower(hex(randomblob(2))), 2) || '-' ||
          substr('89ab', abs(random()) % 4 + 1, 1) ||
          substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
          'Debit Card', 'BadgeDollarSign', 1
        WHERE NOT EXISTS (
          SELECT 1 FROM account_types WHERE label = 'Debit Card' COLLATE NOCASE AND deleted_at IS NULL
        );
      `);
      await createCreditCardTables(db);
      await updateDBVersion(db, 15);
    });
  }

  if (currentVersion < 16) {
    await db.withTransactionAsync(async () => {
      const columns = await db.getAllAsync<{ name: string }>(
        "PRAGMA table_info(credit_card_settings);",
      );
      if (!columns.some(({ name }) => name === "first_cycle_mode")) {
        await db.execAsync(
          "ALTER TABLE credit_card_settings ADD COLUMN first_cycle_mode VARCHAR(10) NOT NULL DEFAULT 'next' CHECK (first_cycle_mode IN ('current', 'next'));",
        );
      }
      await updateDBVersion(db, 16);
    });
  }

  if (currentVersion < 17) {
    await db.withTransactionAsync(async () => {
      await createTransactionAttachmentTable(db);
      await updateDBVersion(db, 17);
    });
  }
};
