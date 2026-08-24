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

export const insertCategoryMgmtTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 1, 'Salary', 'Briefcase', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 1, 'Allowance', 'HandCoins', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 1, 'Bonus', 'Gift', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 1, 'Freelance', 'Laptop', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 1, 'Investment', 'TrendingUp', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 1, 'Refund', 'RotateCcw', NULL);

    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 2, 'Meals', 'Utensils', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 2, 'Grocery', 'ShoppingBasket', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 2, 'Transport', 'Car', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 2, 'Housing', 'House', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 2, 'Utilities', 'Lightbulb', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 2, 'Bills', 'Receipt', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 2, 'Shopping', 'ShoppingBag', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 2, 'Medical', 'HeartPulse', 'Medicine and consultation fee');
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 2, 'Education', 'GraduationCap', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 2, 'Entertainment', 'Gamepad2', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 2, 'Insurance', 'Shield', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 2, 'Travel', 'Plane', NULL);
    INSERT INTO categories (id, type_id, label, icon, descriptions) VALUES ('${randomUUID()}', 2, 'Other Expense', 'CircleEllipsis', NULL);

    UPDATE categories SET translation_key = label;
  `);
};
