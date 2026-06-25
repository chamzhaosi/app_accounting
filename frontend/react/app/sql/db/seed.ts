import * as SQLite from "expo-sqlite";

export const insertAccTypTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    INSERT INTO account_types (name) VALUES ('Cash12');
    INSERT INTO account_types (name) VALUES ('Bank22');
    INSERT INTO account_types (name) VALUES ('E-Wallet2');
  `);
};
