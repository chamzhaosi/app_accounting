import * as SQLite from "expo-sqlite";
import { randomUUID } from "expo-crypto";

export const DEFAULT_CATEGORY_SEEDS = [
  [1, "Salary", "Briefcase", null, false],
  [1, "Allowance", "HandCoins", null, false],
  [1, "Bonus", "Gift", null, false],
  [1, "Freelance", "Laptop", null, false],
  [1, "Investment", "TrendingUp", null, false],
  [1, "Refund", "RotateCcw", null, false],
  [2, "Meals", "Utensils", null, false],
  [2, "Grocery", "ShoppingBasket", null, false],
  [2, "Transport", "Car", null, false],
  [2, "Housing", "House", null, false],
  [2, "Utilities", "Lightbulb", null, false],
  [2, "Bills", "Receipt", null, false],
  [2, "Shopping", "ShoppingBag", null, false],
  [2, "Medical", "HeartPulse", "Medicine and consultation fee", false],
  [2, "Education", "GraduationCap", null, false],
  [2, "Entertainment", "Gamepad2", null, false],
  [2, "Insurance", "Shield", null, false],
  [2, "Travel", "Plane", null, false],
  [
    2,
    "Fees & Charges",
    "BadgeDollarSign",
    "Bank, card, platform, and service fees",
    true,
  ],
  [2, "Other Expense", "CircleEllipsis", null, false],
] as const;

export const insertAccTypTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    INSERT INTO account_types (id, label, icon, is_system) VALUES ('${randomUUID()}', 'Cash', 'Banknote', 1);
    INSERT INTO account_types (id, label, icon, is_system) VALUES ('${randomUUID()}', 'Bank', 'Landmark', 1);
    INSERT INTO account_types (id, label, icon, is_system) VALUES ('${randomUUID()}', 'E-Wallet', 'WalletMinimal', 1);
    INSERT INTO account_types (id, label, icon, is_system) VALUES ('${randomUUID()}', 'Credit Card', 'CreditCard', 1);
    INSERT INTO account_types (id, label, icon, is_system) VALUES ('${randomUUID()}', 'Debit Card', 'BadgeDollarSign', 1);
  `);
};

export const insertCategoryMgmtTable = async (db: SQLite.SQLiteDatabase) => {
  for (const [
    typeId,
    label,
    icon,
    description,
    isSystem,
  ] of DEFAULT_CATEGORY_SEEDS) {
    await db.runAsync(
      `INSERT INTO categories (
         id, type_id, label, icon, descriptions, translation_key, is_system
       ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [randomUUID(), typeId, label, icon, description, label, isSystem ? 1 : 0],
    );
  }
};
