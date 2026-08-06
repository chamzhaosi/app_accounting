import { randomUUID } from "expo-crypto";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import {
  buildOrderBy,
  DEFAULT_CURRENT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "../db/common";
import { getDB } from "../db/database";
import { SQLQueryOptions } from "../types/common";
import {
  TransactionMgmtCreateReqType,
  TransactionMgmtRspType,
} from "../types/transactionMgmtType";

export const getTransactionMgmtListFromDB = async ({
  orderBy,
  pageSize = DEFAULT_PAGE_SIZE,
  curPage = DEFAULT_CURRENT_PAGE,
}: SQLQueryOptions): Promise<TransactionMgmtRspType[]> => {
  try {
    const db = await getDB();
    const offset = (curPage - 1) * pageSize;
    const result = await db.getAllAsync<TransactionMgmtRspType>(
      `
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
        WHERE transactions.deleted_at IS NULL
          AND transactions.transaction_date >= date(
            'now',
            'localtime',
            'start of month'
          )
          AND transactions.transaction_date < date(
            'now',
            'localtime',
            'start of month',
            '+1 month'
          )
        ${buildOrderBy(orderBy)}
        LIMIT ? OFFSET ?;
      `,
      [pageSize, offset],
    );
    debugLog(DEBUG_TAG.TRANSACTION_MANAGEMENT_DB, "Loaded transaction page", {
      curPage,
      pageSize,
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

export const createNewTransactionMgmtToDB = async (
  data: TransactionMgmtCreateReqType,
): Promise<string> => {
  try {
    const db = await getDB();
    const id = randomUUID();
    const isTransfer = data.transactionType === "transfer";

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
    debugLog(DEBUG_TAG.TRANSACTION_MANAGEMENT_DB, "Created transaction", {
      id,
      transactionType: data.transactionType,
    });

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
