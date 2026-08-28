import { randomUUID } from "expo-crypto";
import { DB_SYNC_STATUS, TXN_TYPE_ENUM } from "../../constants/enum";
import {
  addAmounts,
  isAmountWithinRange,
  multiplyAmount,
  toAmountNumber,
  toCurrencyAmountNumber,
} from "../../utils/amount";
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
  TransactionOperationRspType,
  TransactionMgmtUpdateReqType,
  ExchangeRateSuggestionType,
} from "../types/transactionMgmtType";

export const getExchangeRateSuggestionFromDB = async (
  fromCurrencyCode: string,
  toCurrencyCode: string,
  transactionDate: string,
  excludeTransactionId?: string,
): Promise<ExchangeRateSuggestionType | null> => {
  const db = await getDB();
  const exact = await db.getFirstAsync<{
    id: string;
    exchange_rate: number;
    transaction_date: string;
  }>(
    `SELECT id, exchange_rate, transaction_date
     FROM transactions
     WHERE currency_code = ?
       AND account_currency_code = ?
       AND exchange_rate IS NOT NULL
       AND exchange_rate > 0
       AND transaction_date <= ?
       AND (? IS NULL OR id <> ?)
       AND deleted_at IS NULL
     ORDER BY transaction_date DESC, created_at DESC
     LIMIT 1;`,
    [
      fromCurrencyCode,
      toCurrencyCode,
      transactionDate,
      excludeTransactionId ?? null,
      excludeTransactionId ?? null,
    ],
  );
  if (exact) {
    return {
      rate: exact.exchange_rate,
      source: "previous",
      sourceTransactionId: exact.id,
      transactionDate: exact.transaction_date,
    };
  }

  const inverse = await db.getFirstAsync<{
    id: string;
    exchange_rate: number;
    transaction_date: string;
  }>(
    `SELECT id, exchange_rate, transaction_date
     FROM transactions
     WHERE currency_code = ?
       AND account_currency_code = ?
       AND exchange_rate IS NOT NULL
       AND exchange_rate > 0
       AND transaction_date <= ?
       AND (? IS NULL OR id <> ?)
       AND deleted_at IS NULL
     ORDER BY transaction_date DESC, created_at DESC
     LIMIT 1;`,
    [
      toCurrencyCode,
      fromCurrencyCode,
      transactionDate,
      excludeTransactionId ?? null,
      excludeTransactionId ?? null,
    ],
  );
  if (!inverse) return null;

  return {
    rate: 1 / inverse.exchange_rate,
    source: "inverse",
    sourceTransactionId: inverse.id,
    transactionDate: inverse.transaction_date,
  };
};

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
         ROUND(COALESCE(SUM(
           CASE
             WHEN transaction_type = 'income' AND account_id = ? THEN converted_amount
             WHEN transaction_type = 'expense' AND account_id = ? THEN -converted_amount
             WHEN transaction_type = 'adjustment' AND account_id = ? THEN converted_amount
             WHEN transaction_type = 'transfer' AND from_account_id = ? THEN -amount
             WHEN transaction_type = 'transfer' AND to_account_id = ? THEN converted_amount
             ELSE 0
           END
         ), 0), 3) AS balance_change
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
  currencyCode: string,
): Promise<CategoryDailyTotalType[]> => {
  try {
    const db = await getDB();
    const result = await db.getAllAsync<CategoryDailyTotalType>(
      `SELECT
         transaction_date,
         ROUND(COALESCE(SUM(converted_amount), 0), 3) AS daily_total
       FROM transactions
       WHERE category_id = ?
         AND transaction_date >= ?
         AND transaction_date <= ?
         AND account_currency_code = ?
         AND deleted_at IS NULL
       GROUP BY transaction_date
       ORDER BY transaction_date ASC;`,
      [categoryId, startDate, endDate, currencyCode],
    );
    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Loaded daily category totals",
      {
        categoryId,
        startDate,
        endDate,
        currencyCode,
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
  currencyCode: string,
): Promise<TransactionDailyTotalsType[]> => {
  try {
    const db = await getDB();
    const result = await db.getAllAsync<TransactionDailyTotalsType>(
      `
        SELECT
          transaction_date,
          account_currency_code AS currency_code,
          ROUND(COALESCE(SUM(
            CASE
              WHEN transaction_type = 'income' THEN converted_amount
              WHEN transaction_type = 'adjustment' AND converted_amount > 0 THEN converted_amount
              ELSE 0
            END
          ), 0), 3) AS income_total,
          ROUND(COALESCE(SUM(
            CASE
              WHEN transaction_type = 'expense' THEN converted_amount
              WHEN transaction_type = 'adjustment' AND converted_amount < 0 THEN ABS(converted_amount)
              ELSE 0
            END
          ), 0), 3) AS expense_total,
          ROUND(COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN converted_amount ELSE 0 END), 0), 3) AS recorded_income_total,
          ROUND(COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN converted_amount ELSE 0 END), 0), 3) AS recorded_expense_total
        FROM transactions
        WHERE deleted_at IS NULL
          AND transaction_date >= ?
          AND transaction_date <= ?
          AND account_currency_code = ?
        GROUP BY transaction_date
        ORDER BY transaction_date ASC;
      `,
      [startDate, endDate, currencyCode],
    );

    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Loaded daily transaction totals",
      { startDate, endDate, currencyCode, count: result.length },
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
  accountAmount: number;
};

type StoredTransaction = {
  id: string;
  operation_id: string;
  transaction_role: "main" | "fee";
  transaction_type: TXN_TYPE_ENUM;
  account_id: string | null;
  from_account_id: string | null;
  to_account_id: string | null;
  amount: number;
  converted_amount: number;
};

type BalanceAdjustment = {
  accountId: string;
  amount: number;
};

const TRANSACTION_DETAIL_SELECT = `
  SELECT
    transactions.*,
    categories.label AS category_label,
    categories.translation_key AS category_translation_key,
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
          ROUND(accounts.current_balance - COALESCE((
            SELECT SUM(
              CASE
                WHEN transaction_type = 'income' AND account_id = ? THEN converted_amount
                WHEN transaction_type = 'expense' AND account_id = ? THEN -converted_amount
                WHEN transaction_type = 'adjustment' AND account_id = ? THEN converted_amount
                WHEN transaction_type = 'transfer' AND from_account_id = ? THEN -amount
                WHEN transaction_type = 'transfer' AND to_account_id = ? THEN converted_amount
                ELSE 0
              END
            )
            FROM transactions
            WHERE deleted_at IS NULL
              AND transaction_date >= ?
          ), 0), 3) AS forward_balance
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
          ROUND(COALESCE(SUM(
            CASE
              WHEN transaction_type = 'income' AND account_id = ? THEN converted_amount
              WHEN transaction_type = 'adjustment' AND account_id = ? AND converted_amount > 0 THEN converted_amount
              WHEN transaction_type = 'transfer' AND to_account_id = ? THEN converted_amount
              ELSE 0
            END
          ), 0), 3) AS in_total,
          ROUND(COALESCE(SUM(
            CASE
              WHEN transaction_type = 'expense' AND account_id = ? THEN converted_amount
              WHEN transaction_type = 'adjustment' AND account_id = ? AND converted_amount < 0 THEN ABS(converted_amount)
              WHEN transaction_type = 'transfer' AND from_account_id = ? THEN amount
              ELSE 0
            END
          ), 0), 3) AS out_total
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
  currencyCode?: string,
): Promise<CategoryDateRangeSummaryType[]> => {
  try {
    const db = await getDB();
    const result = await db.getAllAsync<CategoryDateRangeSummaryType>(
      `
        SELECT
          account_currency_code AS currency_code,
          ROUND(COALESCE(SUM(converted_amount), 0), 3) AS total_amount,
          COUNT(*) AS transaction_count
        FROM transactions
        WHERE category_id = ?
          AND transaction_date >= ?
          AND transaction_date <= ?
          ${currencyCode ? "AND account_currency_code = ?" : ""}
          AND deleted_at IS NULL
        GROUP BY account_currency_code;
      `,
      [categoryId, startDate, endDate, ...(currencyCode ? [currencyCode] : [])],
    );

    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Loaded category date range summary",
      { categoryId, startDate, endDate, currencyCode, count: result.length },
    );

    return result;
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
  currencyCode: string,
  accountId?: string,
): Promise<TransactionDateRangeTotalsType> => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<TransactionDateRangeTotalsType>(
      `
        SELECT
          ? AS currency_code,
          ROUND(COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN converted_amount ELSE 0 END), 0), 3) AS income_total,
          ROUND(COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN converted_amount ELSE 0 END), 0), 3) AS expense_total
        FROM transactions
        WHERE deleted_at IS NULL
          AND transaction_date >= ?
          AND transaction_date <= ?
          AND account_currency_code = ?
          ${accountId ? "AND account_id = ?" : ""};
      `,
      accountId
        ? [currencyCode, startDate, endDate, currencyCode, accountId]
        : [currencyCode, startDate, endDate, currencyCode],
    );

    const totals = result ?? {
      currency_code: currencyCode,
      income_total: 0,
      expense_total: 0,
    };
    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Loaded transaction date range totals",
      { startDate, endDate, currencyCode, accountId, ...totals },
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

export const getTransactionPeriodCurrencyCodesFromDB = async (
  startDate: string,
  endDate: string,
  categoryId?: string,
): Promise<string[]> => {
  try {
    const db = await getDB();
    const rows = await db.getAllAsync<{ currency_code: string }>(
      `SELECT DISTINCT account_currency_code AS currency_code
       FROM transactions
       WHERE transaction_date >= ?
         AND transaction_date <= ?
         ${categoryId ? "AND category_id = ?" : ""}
         AND deleted_at IS NULL
       ORDER BY account_currency_code ASC;`,
      [startDate, endDate, ...(categoryId ? [categoryId] : [])],
    );

    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Loaded transaction period currencies",
      { startDate, endDate, categoryId, count: rows.length },
    );
    return rows.map(({ currency_code }) => currency_code);
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT_DB,
      "Error when loading transaction period currencies",
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
  amount: toCurrencyAmountNumber(data.amount, data.currencyCode),
  accountAmount: toCurrencyAmountNumber(
    data.convertedAmount,
    data.accountCurrencyCode,
  ),
});

const getStoredBalanceTransaction = (
  transaction: StoredTransaction,
): BalanceTransaction => ({
  transactionType: transaction.transaction_type,
  accountId: transaction.account_id,
  fromAccountId: transaction.from_account_id,
  toAccountId: transaction.to_account_id,
  amount: transaction.amount,
  accountAmount: transaction.converted_amount,
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
        amount: multiplyAmount(transaction.accountAmount, multiplier),
      },
    ];
  }

  if (transaction.transactionType === TXN_TYPE_ENUM.EXPENSE) {
    if (!transaction.accountId) throw new Error("Expense account is required.");
    return [
      {
        accountId: transaction.accountId,
        amount: multiplyAmount(transaction.accountAmount, -multiplier),
      },
    ];
  }

  if (transaction.transactionType === TXN_TYPE_ENUM.ADJUSTMENT) {
    if (!transaction.accountId)
      throw new Error("Adjustment account is required.");
    return [
      {
        accountId: transaction.accountId,
        amount: multiplyAmount(transaction.accountAmount, multiplier),
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
        amount: multiplyAmount(transaction.amount, -multiplier),
      },
      {
        accountId: transaction.toAccountId,
        amount: multiplyAmount(transaction.accountAmount, multiplier),
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
  const adjustmentsByAccount = new Map<string, number>();
  adjustments.forEach((adjustment) => {
    adjustmentsByAccount.set(
      adjustment.accountId,
      addAmounts(
        adjustmentsByAccount.get(adjustment.accountId) ?? 0,
        adjustment.amount,
      ),
    );
  });

  for (const [accountId, adjustmentAmount] of adjustmentsByAccount) {
    const account = await db.getFirstAsync<{ current_balance: number }>(
      `SELECT current_balance
       FROM accounts
       WHERE id = ?
         ${requireActiveAccount ? "AND is_active = 1 AND deleted_at IS NULL" : ""};`,
      [accountId],
    );
    if (!account) {
      throw new Error(`Account is unavailable: ${accountId}`);
    }
    const nextBalance = addAmounts(account.current_balance, adjustmentAmount);
    if (!isAmountWithinRange(nextBalance)) {
      throw new Error(`Account balance exceeds the supported amount range.`);
    }
    const result = await db.runAsync(
      `
        UPDATE accounts
        SET
          current_balance = ?,
          sync_status = ?,
          updated_at = datetime('now')
        WHERE id = ?
          ${requireActiveAccount ? "AND is_active = 1 AND deleted_at IS NULL" : ""};
      `,
      [nextBalance, DB_SYNC_STATUS.PENDING, accountId],
    );

    if (result.changes !== 1) {
      throw new Error(`Account is unavailable: ${accountId}`);
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
        id,
        operation_id,
        transaction_role,
        transaction_type,
        account_id,
        from_account_id,
        to_account_id,
        amount,
        converted_amount
      FROM transactions
      WHERE id = ?
        AND deleted_at IS NULL;
    `,
    [id],
  );

const getStoredOperationForWrite = async (
  db: Awaited<ReturnType<typeof getDB>>,
  id: string,
): Promise<StoredTransaction[]> => {
  const target = await getStoredTransactionForWrite(db, id);
  if (!target) return [];
  return db.getAllAsync<StoredTransaction>(
    `SELECT
       id,
       operation_id,
       transaction_role,
       transaction_type,
       account_id,
       from_account_id,
       to_account_id,
       amount,
       converted_amount
     FROM transactions
     WHERE operation_id = ?
       AND deleted_at IS NULL
     ORDER BY transaction_role ASC, created_at ASC;`,
    [target.operation_id],
  );
};

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
  currencyCode?: string,
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

    if (currencyCode) {
      filters.push("transactions.account_currency_code = ?");
      filterParams.push(currencyCode);
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
      currencyCode,
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

export const getTransactionOperationByIdFromDB = async (
  id: string,
): Promise<TransactionOperationRspType | null> => {
  const db = await getDB();
  const operation = await db.getFirstAsync<{ operation_id: string }>(
    `SELECT operation_id
     FROM transactions
     WHERE id = ? AND deleted_at IS NULL;`,
    [id],
  );

  if (!operation) return null;

  const rows = await db.getAllAsync<TransactionMgmtRspType>(
    `${TRANSACTION_DETAIL_SELECT}
     WHERE transactions.operation_id = ?
       AND transactions.deleted_at IS NULL
     ORDER BY transactions.transaction_role ASC, transactions.created_at ASC;`,
    [operation.operation_id],
  );
  const main = rows.find((row) => row.transaction_role === "main");
  if (!main) return null;
  return {
    main,
    fees: rows.filter((row) => row.transaction_role === "fee"),
  };
};

export const createNewTransactionMgmtToDB = async (
  data: TransactionMgmtCreateReqType,
): Promise<string> => {
  try {
    const db = await getDB();
    const id = randomUUID();
    const operationId = id;
    const isTransfer = data.transactionType === "transfer";
    const mainBalanceAdjustments = getBalanceAdjustments(
      getBalanceTransaction(data),
    );
    const feeBalanceAdjustments: BalanceAdjustment[] = data.fees.map((fee) => ({
      accountId: fee.accountId,
      amount: multiplyAmount(fee.amount, -1),
    }));
    const balanceAdjustments = [
      ...mainBalanceAdjustments,
      ...feeBalanceAdjustments,
    ];

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
            operation_id,
            transaction_role,
            amount,
            currency_code,
            account_currency_code,
            converted_amount,
            exchange_rate,
            exchange_rate_source,
            exchange_rate_source_transaction_id,
            descriptions,
            transaction_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'main', ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          id,
          data.transactionType,
          isTransfer ? null : data.categoryId,
          isTransfer ? null : data.accountId,
          isTransfer ? data.fromAccountId : null,
          isTransfer ? data.toAccountId : null,
          operationId,
          toCurrencyAmountNumber(data.amount, data.currencyCode),
          data.currencyCode,
          data.accountCurrencyCode,
          toCurrencyAmountNumber(
            data.convertedAmount,
            data.accountCurrencyCode,
          ),
          data.exchangeRate ? Number(data.exchangeRate) : null,
          data.exchangeRateSource ?? null,
          data.exchangeRateSourceTransactionId?.trim() || null,
          data.description || null,
          data.transactionDate,
        ],
      );

      for (const fee of data.fees) {
        const feeId = randomUUID();
        const feeAccount = await db.getFirstAsync<{ currency_code: string }>(
          `SELECT currency_code
           FROM accounts
           WHERE id = ? AND is_active = 1 AND deleted_at IS NULL;`,
          [fee.accountId],
        );
        if (!feeAccount) {
          throw new Error(`Fee account is unavailable: ${fee.accountId}`);
        }

        await db.runAsync(
          `
            INSERT INTO transactions (
              id,
              transaction_type,
              category_id,
              account_id,
              from_account_id,
              to_account_id,
              operation_id,
              transaction_role,
              amount,
              currency_code,
              account_currency_code,
              converted_amount,
              descriptions,
              transaction_date
            ) VALUES (?, 'expense', ?, ?, NULL, NULL, ?, 'fee', ?, ?, ?, ?, 'Transaction fee', ?);
          `,
          [
            feeId,
            fee.categoryId,
            fee.accountId,
            operationId,
            toCurrencyAmountNumber(fee.amount, feeAccount.currency_code),
            feeAccount.currency_code,
            feeAccount.currency_code,
            toCurrencyAmountNumber(fee.amount, feeAccount.currency_code),
            data.transactionDate,
          ],
        );
      }

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
    const newBalanceAdjustments = [
      ...getBalanceAdjustments(getBalanceTransaction(data)),
      ...data.fees.map((fee) => ({
        accountId: fee.accountId,
        amount: multiplyAmount(fee.amount, -1),
      })),
    ];
    let reversedBalanceAdjustments: BalanceAdjustment[] = [];

    await db.withTransactionAsync(async () => {
      const currentRows = await getStoredOperationForWrite(db, data.id);
      const currentMain = currentRows.find(
        (row) => row.transaction_role === "main",
      );
      if (!currentMain) throw new Error(`Transaction not found: ${data.id}`);

      reversedBalanceAdjustments = currentRows.flatMap((row) =>
        getBalanceAdjustments(getStoredBalanceTransaction(row), -1),
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
            currency_code = ?,
            account_currency_code = ?,
            converted_amount = ?,
            exchange_rate = ?,
            exchange_rate_source = ?,
            exchange_rate_source_transaction_id = ?,
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
          toCurrencyAmountNumber(data.amount, data.currencyCode),
          data.currencyCode,
          data.accountCurrencyCode,
          toCurrencyAmountNumber(
            data.convertedAmount,
            data.accountCurrencyCode,
          ),
          data.exchangeRate ? Number(data.exchangeRate) : null,
          data.exchangeRateSource ?? null,
          data.exchangeRateSourceTransactionId?.trim() || null,
          data.description || null,
          data.transactionDate,
          DB_SYNC_STATUS.PENDING,
          currentMain.id,
        ],
      );
      if (result.changes !== 1) {
        throw new Error(`Transaction not found: ${data.id}`);
      }

      await db.runAsync(
        `UPDATE transactions
         SET
           deleted_at = datetime('now'),
           is_active = 0,
           sync_status = ?,
           updated_at = datetime('now')
         WHERE operation_id = ?
           AND transaction_role = 'fee'
           AND deleted_at IS NULL;`,
        [DB_SYNC_STATUS.PENDING, currentMain.operation_id],
      );

      for (const fee of data.fees) {
        const feeId = randomUUID();
        const feeAccount = await db.getFirstAsync<{ currency_code: string }>(
          `SELECT currency_code
           FROM accounts
           WHERE id = ? AND is_active = 1 AND deleted_at IS NULL;`,
          [fee.accountId],
        );
        if (!feeAccount) {
          throw new Error(`Fee account is unavailable: ${fee.accountId}`);
        }
        await db.runAsync(
          `INSERT INTO transactions (
             id, transaction_type, category_id, account_id,
             from_account_id, to_account_id, operation_id, transaction_role,
             amount, currency_code, account_currency_code, converted_amount,
             descriptions, transaction_date
           ) VALUES (
             ?, 'expense', ?, ?, NULL, NULL, ?, 'fee',
             ?, ?, ?, ?, 'Transaction fee', ?
           );`,
          [
            feeId,
            fee.categoryId,
            fee.accountId,
            currentMain.operation_id,
            toCurrencyAmountNumber(fee.amount, feeAccount.currency_code),
            feeAccount.currency_code,
            feeAccount.currency_code,
            toCurrencyAmountNumber(fee.amount, feeAccount.currency_code),
            data.transactionDate,
          ],
        );
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
      const currentRows = await getStoredOperationForWrite(db, id);
      if (!currentRows.length) throw new Error(`Transaction not found: ${id}`);

      reversedBalanceAdjustments = currentRows.flatMap((row) =>
        getBalanceAdjustments(getStoredBalanceTransaction(row), -1),
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
          WHERE operation_id = ?
            AND deleted_at IS NULL;
        `,
        [DB_SYNC_STATUS.PENDING, currentRows[0].operation_id],
      );
      if (result.changes !== currentRows.length)
        throw new Error(`Unable to delete complete operation: ${id}`);
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
