import { checkCurrentDBVersion, updateDBVersion } from "./common";
import { db } from "./database";
import { createAccTypTable } from "./schemas";
import { insertAccTypTable } from "./seed";

export const runMigrations = async () => {
  const currentVersion = (await checkCurrentDBVersion())?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.withTransactionAsync(async () => {
      await createAccTypTable();
      await insertAccTypTable();
      await updateDBVersion(1);
    });
  }
};
