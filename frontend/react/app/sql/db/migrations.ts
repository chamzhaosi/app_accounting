import { checkCurrentDBVersion, updateDBVersion } from "./common";
import * as SQLite from "expo-sqlite";
import { createAccTypTable } from "./schemas";
import { insertAccTypTable } from "./seed";

export const runMigrations = async (db: SQLite.SQLiteDatabase) => {
  const currentVersion = (await checkCurrentDBVersion(db))?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.withTransactionAsync(async () => {
      await createAccTypTable(db);
      await insertAccTypTable(db);
      await updateDBVersion(db, 1);
    });
  }
};
