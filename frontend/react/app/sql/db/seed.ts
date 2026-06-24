import * as SQLite from "expo-sqlite";

export const insertAccTypTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    INSERT INTO account_types (name) VALUES ('Cash1');
    INSERT INTO account_types (name) VALUES ('Bank2');
    INSERT INTO account_types (name) VALUES ('E-Wallet');
  `);
};
