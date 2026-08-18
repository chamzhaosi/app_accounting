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
};
