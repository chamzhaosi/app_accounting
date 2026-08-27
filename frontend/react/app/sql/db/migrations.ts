import { checkCurrentDBVersion, updateDBVersion } from "./common";
import * as SQLite from "expo-sqlite";
import {
  createAccMgmtTable,
  createAccountSettingsTable,
  createAccTypTable,
  createBudgetTables,
  createCategoryMgmtTable,
  createCurrencyPreferencesTable,
  createTransactionMgmtTable,
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
        OR (type_id = 2 AND label = 'Other Expense' AND icon = 'CircleEllipsis')
      );
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
};
