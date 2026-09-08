import { randomUUID } from "expo-crypto";
import { getDB } from "../db/database";
import type { CreditCardCycleType } from "../types/accMgmtType";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

export type CreditCardSettingRow = {
  account_id: string;
  book_id: string;
  account_label: string;
  currency_code: string;
  reminder_enabled: boolean;
  statement_day: number;
  due_day: number;
  reminder_lead_days: number;
  reminder_time: string;
  stop_condition: "full" | "minimum";
  first_cycle_mode: "current" | "next";
  account_is_active: boolean;
  book_is_active: boolean;
};

export const getEnabledCreditCardSettingsFromDB = async () => {
  const db = await getDB();
  return db.getAllAsync<CreditCardSettingRow>(`
    SELECT credit_card_settings.*, accounts.label AS account_label,
      accounts.currency_code, accounts.is_active AS account_is_active,
      books.is_active AS book_is_active
    FROM credit_card_settings
    INNER JOIN accounts ON accounts.id = credit_card_settings.account_id
    INNER JOIN books ON books.id = credit_card_settings.book_id
    WHERE accounts.deleted_at IS NULL AND books.is_active = 1;
  `);
};

export const getCreditCardSettingFromDB = async (accountId: string) => {
  const db = await getDB();
  return db.getFirstAsync<CreditCardSettingRow>(
    `
    SELECT credit_card_settings.*, accounts.label AS account_label,
      accounts.currency_code, accounts.is_active AS account_is_active,
      books.is_active AS book_is_active
    FROM credit_card_settings
    INNER JOIN accounts ON accounts.id = credit_card_settings.account_id
    INNER JOIN books ON books.id = credit_card_settings.book_id
    WHERE credit_card_settings.account_id = ? AND accounts.deleted_at IS NULL;
  `,
    [accountId],
  );
};

export const getCreditCardCyclesFromDB = async (
  accountId: string,
  bookId: string,
) => {
  const db = await getDB();
  return db.getAllAsync<CreditCardCycleType>(
    `
    SELECT * FROM credit_card_cycles
    WHERE account_id = ? AND book_id = ? ORDER BY statement_date ASC;
  `,
    [accountId, bookId],
  );
};

export const getCurrentCreditCardCycleFromDB = async (
  accountId: string,
  bookId: string,
) => {
  const db = await getDB();
  return db.getFirstAsync<CreditCardCycleType>(
    `
    SELECT * FROM credit_card_cycles
    WHERE account_id = ? AND book_id = ?
      AND statement_date <= date('now', 'localtime')
    ORDER BY statement_date DESC LIMIT 1;
  `,
    [accountId, bookId],
  );
};

export const ensureCreditCardCycleFromDB = async (data: {
  bookId: string;
  accountId: string;
  periodStart: string;
  statementDate: string;
  dueDate: string;
}) => {
  const db = await getDB();
  await db.runAsync(
    `
    INSERT OR IGNORE INTO credit_card_cycles (
      id, book_id, account_id, period_start, statement_date, due_date
    ) VALUES (?, ?, ?, ?, ?, ?);
  `,
    [
      randomUUID(),
      data.bookId,
      data.accountId,
      data.periodStart,
      data.statementDate,
      data.dueDate,
    ],
  );
};

export const getBalanceAtStatementFromDB = async (
  accountId: string,
  statementDate: string,
  bookId: string,
) => {
  const db = await getDB();
  const row = await db.getFirstAsync<{ balance: number }>(
    `
    SELECT ROUND(accounts.current_balance - COALESCE(SUM(
      CASE
        WHEN transactions.transaction_date < ? THEN 0
        WHEN transactions.transaction_type = 'income' AND transactions.account_id = ? THEN transactions.converted_amount
        WHEN transactions.transaction_type = 'expense' AND transactions.account_id = ? THEN -transactions.converted_amount
        WHEN transactions.transaction_type = 'adjustment' AND transactions.account_id = ? THEN transactions.converted_amount
        WHEN transactions.transaction_type = 'transfer' AND transactions.to_account_id = ? THEN transactions.converted_amount
        WHEN transactions.transaction_type = 'transfer' AND transactions.from_account_id = ? THEN -transactions.amount
        ELSE 0
      END
    ), 0), 3) AS balance
    FROM accounts
    LEFT JOIN transactions ON transactions.deleted_at IS NULL
      AND transactions.book_id = accounts.book_id
      AND (
        transactions.account_id = accounts.id OR
        transactions.from_account_id = accounts.id OR
        transactions.to_account_id = accounts.id
      )
    WHERE accounts.id = ? AND accounts.book_id = ?
      AND accounts.deleted_at IS NULL;
  `,
    [
      statementDate,
      accountId,
      accountId,
      accountId,
      accountId,
      accountId,
      accountId,
      bookId,
    ],
  );
  return row?.balance ?? 0;
};

export const getCreditsAfterStatementFromDB = async (
  accountId: string,
  statementDate: string,
  bookId: string,
  beforeDate?: string,
) => {
  const db = await getDB();
  const row = await db.getFirstAsync<{ total: number }>(
    `
    SELECT ROUND(COALESCE(SUM(
      CASE
        WHEN transaction_type = 'income' AND account_id = ? THEN converted_amount
        WHEN transaction_type = 'adjustment' AND account_id = ? AND converted_amount > 0 THEN converted_amount
        WHEN transaction_type = 'transfer' AND to_account_id = ? THEN converted_amount
        ELSE 0
      END
    ), 0), 3) AS total
    FROM transactions
    WHERE deleted_at IS NULL AND transaction_date >= ? AND book_id = ?
      ${beforeDate ? "AND transaction_date < ?" : ""};
  `,
    beforeDate
      ? [accountId, accountId, accountId, statementDate, bookId, beforeDate]
      : [accountId, accountId, accountId, statementDate, bookId],
  );
  return row?.total ?? 0;
};

export const updateCreditCardCycleFromDB = async (
  id: string,
  bookId: string,
  data: Pick<
    CreditCardCycleType,
    "statement_amount" | "credited_amount" | "remaining_due" | "status"
  >,
) => {
  const db = await getDB();
  await db.runAsync(
    `UPDATE credit_card_cycles SET
    statement_amount = ?, credited_amount = ?, remaining_due = ?, status = ?,
    updated_at = datetime('now') WHERE id = ? AND book_id = ?;`,
    [
      data.statement_amount,
      data.credited_amount,
      data.remaining_due,
      data.status,
      id,
      bookId,
    ],
  );
};

export const setCreditCardCycleNotificationsFromDB = async (
  id: string,
  bookId: string,
  identifiers: string[],
) => {
  const db = await getDB();
  await db.runAsync(
    "UPDATE credit_card_cycles SET notification_ids = ?, updated_at = datetime('now') WHERE id = ? AND book_id = ?;",
    [JSON.stringify(identifiers), id, bookId],
  );
};

export const setCreditCardCycleSkippedFromDB = async (
  id: string,
  bookId: string,
  skipped: boolean,
) => {
  const db = await getDB();
  await db.runAsync(
    "UPDATE credit_card_cycles SET is_skipped = ?, status = CASE WHEN ? = 1 THEN 'skipped' ELSE 'pending' END, updated_at = datetime('now') WHERE id = ? AND book_id = ?;",
    [skipped ? 1 : 0, skipped ? 1 : 0, id, bookId],
  );
  debugLog(DEBUG_TAG.CREDIT_CARD_DB, "Changed cycle skipped state", {
    id,
    skipped,
  });
};

export const confirmCreditCardMinimumFromDB = async (
  id: string,
  bookId: string,
  accountId: string,
  transactionId: string,
) => {
  const db = await getDB();
  await db.runAsync(
    `UPDATE credit_card_cycles SET
    minimum_payment_confirmed = 1,
    minimum_payment_transaction_id = ?,
    minimum_payment_amount = (
      SELECT converted_amount FROM transactions
      WHERE id = ? AND to_account_id = ? AND book_id = ? AND deleted_at IS NULL
    ),
    status = 'minimum_paid', updated_at = datetime('now')
    WHERE id = ? AND book_id = ?;`,
    [transactionId, transactionId, accountId, bookId, id, bookId],
  );
};

export const validateCreditCardMinimumFromDB = async (
  cycle: CreditCardCycleType,
) => {
  if (!cycle.minimum_payment_confirmed || !cycle.minimum_payment_transaction_id)
    return false;
  const db = await getDB();
  const row = await db.getFirstAsync<{ id: string }>(
    `
    SELECT id FROM transactions WHERE id = ? AND transaction_type = 'transfer'
      AND to_account_id = ? AND transaction_date >= ? AND transaction_date <= ?
      AND book_id = ? AND deleted_at IS NULL
      AND converted_amount = ?;
    `,
    [
      cycle.minimum_payment_transaction_id,
      cycle.account_id,
      cycle.statement_date,
      cycle.due_date,
      cycle.book_id,
      cycle.minimum_payment_amount,
    ],
  );
  if (row) return true;
  await db.runAsync(
    "UPDATE credit_card_cycles SET minimum_payment_confirmed = 0, minimum_payment_transaction_id = NULL, minimum_payment_amount = NULL WHERE id = ? AND book_id = ?;",
    [cycle.id, cycle.book_id],
  );
  return false;
};
