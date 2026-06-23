import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migrations";

export const db = await SQLite.openDatabaseAsync("finora-db");

export const initDB = async () => {
  const db = await SQLite.openDatabaseAsync("finora-db");

  // await initDBSetup();
  // await runMigrations();
};

const initDBSetup = async () => {
  await db.withTransactionAsync(async () => {
    await db.execAsync(`PRAGMA journal_mode = WAL`);
    await db.execAsync(`PRAGMA key = 'password'`);
  });
};
