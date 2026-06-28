import * as SQLite from "expo-sqlite";
import { randomUUID } from "expo-crypto";

export const insertAccTypTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    INSERT INTO account_types (id, label, icon, is_system) VALUES ('${randomUUID()}', 'Cash', 'Banknote', 1);
    INSERT INTO account_types (id, label, icon, is_system) VALUES ('${randomUUID()}', 'Bank', 'Landmark', 1);
    INSERT INTO account_types (id, label, icon, is_system) VALUES ('${randomUUID()}', 'E-Wallet', 'WalletMinimal', 1);
    INSERT INTO account_types (id, label, icon, is_system) VALUES ('${randomUUID()}', 'Card', 'CreditCard', 1);
  `);
};
