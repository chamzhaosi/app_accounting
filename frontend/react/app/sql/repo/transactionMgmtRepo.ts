import { randomUUID } from "expo-crypto";
import { DB_SYNC_STATUS, TXN_TYPE_ENUM } from "../../constants/enum";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import {
  buildOrderBy,
  DEFAULT_CURRENT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "../db/common";
import { getDB } from "../db/database";
import { SQLQueryOptions } from "../types/common";
import {
  AccountDailyBalanceChangeType,
  AccountDateRangeFlowTotalsType,
  CategoryDailyTotalType,
  CategoryDateRangeSummaryType,
  TransactionDailyTotalsType,
  TransactionDateRangeTotalsType,
  TransactionMgmtCreateReqType,
  TransactionMgmtRspType,
  TransactionMgmtUpdateReqType,
} from "../types/transactionMgmtType";

export const getAccountDailyBalanceChangesFromDB = async (
  accountId: string,
  startDate: string,
  endDate: string,
): Promise<AccountDailyBalanceChangeType[]> => {
  try {
    const db = await getDB();
    const result = await db.getAllAsync<AccountDailyBalanceChangeType>(
      `SELECT
         transaction_date,
         COALESCE(SUM(
           CASE
             WHEN transaction_type = 'income' AND account_id = ? THEN amount
             WHEN transaction_type = 'expense' AND account_id = ? THEN -amount
             WHEN transaction_type = 'adjustment' AND account_id = ? THEN amount
             WHEN transaction_type = 'transfer' AND from_account_id = ? THEN -amount
             WHEN transaction_type = 'transfer' AND to_account_id = ? THEN amount
             ELSE 0
           END
         ), 0) AS balance_change
       FROM transactions
       WHERE deleted_at IS NULL
         AND transaction_date >= ?
         AND transaction_date <= ?
         AND (account_id = ? OR from_account_id = ? OR to_account_id = ?)
       GROUP BY transaction_date
       ORDER BY transaction_date ASC;`,
      [
        accountId,
        accountId,
        accountId,
        accountId,
        accountId,
        startDate,
        endDate,
        accountId,
        accountId,
        accountId,
      ],
    );
    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Loaded daily account balance changes",
      {
        accountId,
        startDate,
        endDate,
        count: result.length,
      },
    );
    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Error when loading daily account balance changes",
      e,
    );
    throw e;
  }
};

export const getCategoryDailyTotalsFromDB = async (
  categoryId: string,
  startDate: string,
  endDate: string,
): Promise<CategoryDailyTotalType[]> => {
  try {
    const db = await getDB();
    const result = await db.getAllAsync<CategoryDailyTotalType>(
      `SELECT
         transaction_date,
         COALESCE(SUM(amount), 0) AS daily_total
       FROM transactions
       WHERE category_id = ?
         AND transaction_date >= ?
         AND transaction_date <= ?
         AND deleted_at IS NULL
       GROUP BY transaction_date
       ORDER BY transaction_date ASC;`,
      [categoryId, startDate, endDate],
    );
    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Loaded daily category totals",
      {
        categoryId,
        startDate,
        endDate,
        count: result.length,
      },
    );
    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Error when loading daily category totals",
      e,
    );
    throw e;
  }
};

export const getTransactionDailyTotalsFromDB = async (
  startDate: string,
  endDate: string,
): Promise<TransactionDailyTotalsType[]> => {
  try {
    const db = await getDB();
    const result = await db.getAllAsync<TransactionDailyTotalsType>(
      `
        SELECT
          transaction_date,
          COALESCE(SUM(
            CASE
              WHEN transaction_type = 'income' THEN amount
              WHEN transaction_type = 'adjustment' AND amount > 0 THEN amount
              ELSE 0
            END
          ), 0) AS income_total,
          COALESCE(SUM(
            CASE
              WHEN transaction_type = 'expense' THEN amount
              WHEN transaction_type = 'adjustment' AND amount < 0 THEN ABS(amount)
              ELSE 0
            END
          ), 0) AS expense_total,
          COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) AS recorded_income_total,
          COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) AS recorded_expense_total
        FROM transactions
        WHERE deleted_at IS NULL
          AND transaction_date >= ?
          AND transaction_date <= ?
        GROUP BY transaction_date
        ORDER BY transaction_date ASC;
      `,
      [startDate, endDate],
    );

    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Loaded daily transaction totals",
      { startDate, endDate, count: result.length },
    );

    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Error when getting daily transaction totals from db",
      e,
    );
    throw e;
  }
};

type BalanceTransaction = {
  transactionType: TXN_TYPE_ENUM;
  accountId: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
  amount: number;
};

type StoredTransaction = {
  transaction_type: TXN_TYPE_ENUM;
  account_id: string | null;
  from_account_id: string | null;
  to_account_id: string | null;
  amount: number;
};

type BalanceAdjustment = {
  accountId: string;
  amount: number;
};

const TRANSACTION_DETAIL_SELECT = `
  SELECT
    transactions.*,
    categories.label AS category_label,
    categories.icon AS category_icon,
    accounts.label AS account_label,
    from_accounts.label AS from_account_label,
    to_accounts.label AS to_account_label
  FROM transactions
  LEFT JOIN categories
    ON categories.id = transactions.category_id
  LEFT JOIN accounts
    ON accounts.id = transactions.account_id
  LEFT JOIN accounts AS from_accounts
    ON from_accounts.id = transactions.from_account_id
  LEFT JOIN accounts AS to_accounts
    ON to_accounts.id = transactions.to_account_id
`;

export const getAccountForwardBalanceFromDB = async (
  accountId: string,
  startDate: string,
): Promise<number> => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<{ forward_balance: number }>(
      `
        SELECT
          accounts.current_balance - COALESCE((
            SELECT SUM(
              CASE
                WHEN transaction_type = 'income' AND account_id = ? THEN amount
                WHEN transaction_type = 'expense' AND account_id = ? THEN -amount
                WHEN transaction_type = 'adjustment' AND account_id = ? THEN amount
                WHEN transaction_type = 'transfer' AND from_account_id = ? THEN -amount
                WHEN transaction_type = 'transfer' AND to_account_id = ? THEN amount
                ELSE 0
              END
            )
            FROM transactions
            WHERE deleted_at IS NULL
              AND transaction_date >= ?
          ), 0) AS forward_balance
        FROM accounts
        WHERE id = ?
          AND deleted_at IS NULL;
      `,
      [
        accountId,
        accountId,
        accountId,
        accountId,
        accountId,
        startDate,
        accountId,
      ],
    );

    const forwardBalance = result?.forward_balance ?? 0;
    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Loaded account forward balance",
      { accountId, startDate, forwardBalance },
    );

    return forwardBalance;
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Error when getting account forward balance from db",
      e,
    );
    throw e;
  }
};

export const getAccountDateRangeFlowTotalsFromDB = async (
  accountId: string,
  startDate: string,
  endDate: string,
): Promise<AccountDateRangeFlowTotalsType> => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<AccountDateRangeFlowTotalsType>(
      `
        SELECT
          COALESCE(SUM(
            CASE
              WHEN transaction_type = 'income' AND account_id = ? THEN amount
              WHEN transaction_type = 'adjustment' AND account_id = ? AND amount > 0 THEN amount
              WHEN transaction_type = 'transfer' AND to_account_id = ? THEN amount
              ELSE 0
            END
          ), 0) AS in_total,
          COALESCE(SUM(
            CASE
              WHEN transaction_type = 'expense' AND account_id = ? THEN amount
              WHEN transaction_type = 'adjustment' AND account_id = ? AND amount < 0 THEN ABS(amount)
              WHEN transaction_type = 'transfer' AND from_account_id = ? THEN amount
              ELSE 0
            END
          ), 0) AS out_total
        FROM transactions
        WHERE deleted_at IS NULL
          AND transaction_date >= ?
          AND transaction_date <= ?;
      `,
      [
        accountId,
        accountId,
        accountId,
        accountId,
        accountId,
        accountId,
        startDate,
        endDate,
      ],
    );

    const totals = result ?? { in_total: 0, out_total: 0 };
    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Loaded account flow totals",
      { accountId, startDate, endDate, ...totals },
    );

    return totals;
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Error when getting account flow totals from db",
      e,
    );
    throw e;
  }
};

export const getCategoryDateRangeSummaryFromDB = async (
  categoryId: string,
  startDate: string,
  endDate: string,
): Promise<CategoryDateRangeSummaryType> => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<CategoryDateRangeSummaryType>(
      `
        SELECT
          COALESCE(SUM(amount), 0) AS total_amount,
          COUNT(*) AS transaction_count
        FROM transactions
        WHERE category_id = ?
          AND transaction_date >= ?
          AND transaction_date <= ?
          AND deleted_at IS NULL;
      `,
      [categoryId, startDate, endDate],
    );

    const summary = result ?? { total_amount: 0, transaction_count: 0 };
    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Loaded category date range summary",
      { categoryId, startDate, endDate, ...summary },
    );

    return summary;
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Error when getting category date range summary from db",
      e,
    );
    throw e;
  }
};

export const getTransactionDateRangeTotalsFromDB = async (
  startDate: string,
  endDate: string,
  accountId?: string,
): Promise<TransactionDateRangeTotalsType> => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<TransactionDateRangeTotalsType>(
      `
        SELECT
          COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) AS income_total,
          COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) AS expense_total
        FROM transactions
        WHERE deleted_at IS NULL
          AND transaction_date >= ?
          AND transaction_date <= ?
          ${accountId ? "AND account_id = ?" : ""};
      `,
      accountId ? [startDate, endDate, accountId] : [startDate, endDate],
    );

    const totals = result ?? { income_total: 0, expense_total: 0 };
    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Loaded transaction date range totals",
      { startDate, endDate, accountId, ...totals },
    );

    return totals;
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Error when getting transaction date range totals from db",
      e,
    );
    throw e;
  }
};

const getBalanceTransaction = (
  data: TransactionMgmtCreateReqType,
): BalanceTransaction => ({
  transactionType: data.transactionType,
  accountId: data.accountId || null,
  fromAccountId: data.fromAccountId || null,
  toAccountId: data.toAccountId || null,
  amount: Number(data.amount),
});

const getStoredBalanceTransaction = (
  transaction: StoredTransaction,
): BalanceTransaction => ({
  transactionType: transaction.transaction_type,
  accountId: transaction.account_id,
  fromAccountId: transaction.from_account_id,
  toAccountId: transaction.to_account_id,
  amount: transaction.amount,
});

const getBalanceAdjustments = (
  transaction: BalanceTransaction,
  multiplier = 1,
): BalanceAdjustment[] => {
  if (transaction.transactionType === TXN_TYPE_ENUM.INCOME) {
    if (!transaction.accountId) throw new Error("Income account is required.");
    return [
      {
        accountId: transaction.accountId,
        amount: transaction.amount * multiplier,
      },
    ];
  }

  if (transaction.transactionType === TXN_TYPE_ENUM.EXPENSE) {
    if (!transaction.accountId) throw new Error("Expense account is required.");
    return [
      {
        accountId: transaction.accountId,
        amount: -transaction.amount * multiplier,
      },
    ];
  }

  if (transaction.transactionType === TXN_TYPE_ENUM.ADJUSTMENT) {
    if (!transaction.accountId)
      throw new Error("Adjustment account is required.");
    return [
      {
        accountId: transaction.accountId,
        amount: transaction.amount * multiplier,
      },
    ];
  }

  if (transaction.transactionType === TXN_TYPE_ENUM.TRANSFER) {
    if (!transaction.fromAccountId || !transaction.toAccountId) {
      throw new Error("Transfer accounts are required.");
    }

    return [
      {
        accountId: transaction.fromAccountId,
        amount: -transaction.amount * multiplier,
      },
      {
        accountId: transaction.toAccountId,
        amount: transaction.amount * multiplier,
      },
    ];
  }

  throw new Error(
    `Unsupported transaction type: ${transaction.transactionType}`,
  );
};

const applyBalanceAdjustments = async (
  db: Awaited<ReturnType<typeof getDB>>,
  adjustments: BalanceAdjustment[],
  requireActiveAccount: boolean,
) => {
  for (const adjustment of adjustments) {
    const result = await db.runAsync(
      `
        UPDATE accounts
        SET
          current_balance = ROUND(current_balance + ?, 2),
          sync_status = ?,
          updated_at = datetime('now')
        WHERE id = ?
          ${requireActiveAccount ? "AND is_active = 1 AND deleted_at IS NULL" : ""};
      `,
      [adjustment.amount, DB_SYNC_STATUS.PENDING, adjustment.accountId],
    );

    if (result.changes !== 1) {
      throw new Error(`Account is unavailable: ${adjustment.accountId}`);
    }
  }
};

const getStoredTransactionForWrite = async (
  db: Awaited<ReturnType<typeof getDB>>,
  id: string,
) =>
  db.getFirstAsync<StoredTransaction>(
    `
      SELECT
        transaction_type,
        account_id,
        from_account_id,
        to_account_id,
        amount
      FROM transactions
      WHERE id = ?
        AND deleted_at IS NULL;
    `,
    [id],
  );

export const getTransactionMgmtListFromDB = async (
  {
    orderBy,
    pageSize = DEFAULT_PAGE_SIZE,
    curPage = DEFAULT_CURRENT_PAGE,
  }: SQLQueryOptions,
  startDate: string,
  endDate: string,
  accountId?: string,
  categoryId?: string,
): Promise<TransactionMgmtRspType[]> => {
  try {
    const db = await getDB();
    const offset = (curPage - 1) * pageSize;
    const filters: string[] = [];
    const filterParams: (string | number)[] = [];

    if (accountId) {
      filters.push(
        `
          (
            transactions.account_id = ?
            OR (
              transactions.transaction_type = 'transfer'
              AND (
                transactions.from_account_id = ?
                OR transactions.to_account_id = ?
              )
            )
          )
        `,
      );
      filterParams.push(accountId, accountId, accountId);
    }

    if (categoryId) {
      filters.push("transactions.category_id = ?");
      filterParams.push(categoryId);
    }

    const transactionFilter = filters.length
      ? `
          AND ${filters.join(" AND ")}
        `
      : "";
    const params = [startDate, endDate, ...filterParams, pageSize, offset];
    const result = await db.getAllAsync<TransactionMgmtRspType>(
      `
        ${TRANSACTION_DETAIL_SELECT}
        WHERE transactions.deleted_at IS NULL
          AND transactions.transaction_date >= ?
          AND transactions.transaction_date <= ?
          ${transactionFilter}
        ${buildOrderBy(orderBy)}
        LIMIT ? OFFSET ?;
      `,
      params,
    );
    debugLog(DEBUG_TAG.TRANSACTION_MANAGEMENT_DB, "Loaded transaction page", {
      curPage,
      pageSize,
      startDate,
      endDate,
      accountId,
      categoryId,
      count: result.length,
    });

    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Error when getting transaction list from db",
      e,
    );
    throw e;
  }
};

export const getTransactionMgmtByIdFromDB = async (
  id: string,
): Promise<TransactionMgmtRspType | null> => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<TransactionMgmtRspType>(
      `
        ${TRANSACTION_DETAIL_SELECT}
        WHERE transactions.id = ?
          AND transactions.deleted_at IS NULL;
      `,
      [id],
    );
    debugLog(DEBUG_TAG.TRANSACTION_MANAGEMENT_DB, "Loaded transaction by id", {
      id,
      found: Boolean(result),
    });

    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Error when getting transaction by id from db",
      e,
    );
    throw e;
  }
};

export const createNewTransactionMgmtToDB = async (
  data: TransactionMgmtCreateReqType,
): Promise<string> => {
  try {
    const db = await getDB();
    const id = randomUUID();
    const isTransfer = data.transactionType === "transfer";
    const balanceAdjustments = getBalanceAdjustments(
      getBalanceTransaction(data),
    );

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
          INSERT INTO transactions (
            id,
            transaction_type,
            category_id,
            account_id,
            from_account_id,
            to_account_id,
            amount,
            descriptions,
            transaction_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          id,
          data.transactionType,
          isTransfer ? null : data.categoryId,
          isTransfer ? null : data.accountId,
          isTransfer ? data.fromAccountId : null,
          isTransfer ? data.toAccountId : null,
          Number(data.amount),
          data.description || null,
          data.transactionDate,
        ],
      );
      await applyBalanceAdjustments(db, balanceAdjustments, true);
    });
    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Created transaction and updated account balances",
      {
        id,
        transactionType: data.transactionType,
        balanceAdjustments,
      },
    );

    return id;
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Error when creating transaction in db",
      e,
    );
    throw e;
  }
};

export const updateTransactionMgmtToDB = async (
  data: TransactionMgmtUpdateReqType,
) => {
  try {
    const db = await getDB();
    const isTransfer = data.transactionType === "transfer";
    const newBalanceAdjustments = getBalanceAdjustments(
      getBalanceTransaction(data),
    );
    let reversedBalanceAdjustments: BalanceAdjustment[] = [];

    await db.withTransactionAsync(async () => {
      const current = await getStoredTransactionForWrite(db, data.id);
      if (!current) throw new Error(`Transaction not found: ${data.id}`);

      reversedBalanceAdjustments = getBalanceAdjustments(
        getStoredBalanceTransaction(current),
        -1,
      );
      await applyBalanceAdjustments(db, reversedBalanceAdjustments, false);
      await applyBalanceAdjustments(db, newBalanceAdjustments, true);

      const result = await db.runAsync(
        `
          UPDATE transactions
          SET
            transaction_type = ?,
            category_id = ?,
            account_id = ?,
            from_account_id = ?,
            to_account_id = ?,
            amount = ?,
            descriptions = ?,
            transaction_date = ?,
            sync_status = ?,
            updated_at = datetime('now')
          WHERE id = ?
            AND deleted_at IS NULL;
        `,
        [
          data.transactionType,
          isTransfer ? null : data.categoryId,
          isTransfer ? null : data.accountId,
          isTransfer ? data.fromAccountId : null,
          isTransfer ? data.toAccountId : null,
          Number(data.amount),
          data.description || null,
          data.transactionDate,
          DB_SYNC_STATUS.PENDING,
          data.id,
        ],
      );
      if (result.changes !== 1) {
        throw new Error(`Transaction not found: ${data.id}`);
      }
    });
    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Updated transaction and account balances",
      {
        id: data.id,
        transactionType: data.transactionType,
        reversedBalanceAdjustments,
        newBalanceAdjustments,
      },
    );
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Error when updating transaction in db",
      e,
    );
    throw e;
  }
};

export const deleteTransactionMgmtFromDB = async (id: string) => {
  try {
    const db = await getDB();
    let reversedBalanceAdjustments: BalanceAdjustment[] = [];

    await db.withTransactionAsync(async () => {
      const current = await getStoredTransactionForWrite(db, id);
      if (!current) throw new Error(`Transaction not found: ${id}`);

      reversedBalanceAdjustments = getBalanceAdjustments(
        getStoredBalanceTransaction(current),
        -1,
      );
      await applyBalanceAdjustments(db, reversedBalanceAdjustments, false);

      const result = await db.runAsync(
        `
          UPDATE transactions
          SET
            deleted_at = datetime('now'),
            is_active = 0,
            sync_status = ?,
            updated_at = datetime('now')
          WHERE id = ?
            AND deleted_at IS NULL;
        `,
        [DB_SYNC_STATUS.PENDING, id],
      );
      if (result.changes !== 1) throw new Error(`Transaction not found: ${id}`);
    });
    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Deleted transaction and reversed account balances",
      { id, reversedBalanceAdjustments },
    );
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Error when deleting transaction from db",
      e,
    );
    throw e;
  }
};
