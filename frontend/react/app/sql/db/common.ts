import { db } from "./database";

export const checkCurrentDBVersion = async () => {
  return await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
};

export const updateDBVersion = async (vrs: number) => {
  await db.execAsync(`PRAGMA user_version = ${vrs};`);
};
