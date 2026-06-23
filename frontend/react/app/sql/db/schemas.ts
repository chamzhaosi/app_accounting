import { db } from "./database";

export const createAccTypTable = async () => {
  await db.execAsync(`
      CREATE TABLE IF NOT EXISTS account_types (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL
      );
    `);
};
