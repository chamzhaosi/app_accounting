import { checkCurrentDBVersion, updateDBVersion } from "./common";
import * as SQLite from "expo-sqlite";
import {
  createAccMgmtTable,
  createAccTypTable,
  createBudgetTables,
  createCategoryMgmtTable,
  createTransactionMgmtTable,
} from "./schemas";
import { insertAccTypTable, insertCategoryMgmtTable } from "./seed";

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
};
