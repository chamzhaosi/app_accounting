import { DB_SYNC_STATUS, TXN_TYPE_ENUM } from "../../constants/enum";
import {
  absoluteAmount,
  compareAmounts,
  subtractAmounts,
  toCurrencyAmountNumber,
} from "../../utils/amount";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import {
  buildOrderBy,
  DEFAULT_CURRENT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "../db/common";
import { getDB } from "../db/database";
import {
  AccMgmtCreateReqType,
  AccMgmtRspType,
  AccMgmtUpdateReqType,
} from "../types/accMgmtType";
import { SQLQueryOptions } from "../types/common";
import { randomUUID } from "expo-crypto";

export const getMainAccountBalanceFromDB = async (
  currencyCode: string,
): Promise<number> => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<{ balance: number }>(
      `
        SELECT ROUND(COALESCE(SUM(current_balance), 0), 3) AS balance
        FROM accounts
        WHERE is_main_account = 1
          AND is_active = 1
          AND currency_code = ?
          AND deleted_at IS NULL;
      `,
      [currencyCode],
    );

    const balance = result?.balance ?? 0;
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT_DB, "Loaded main account balance", {
      balance,
      currencyCode,
    });

    return balance;
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT_DB,
      "Error when getting main account balance from db",
      e,
    );
    throw e;
  }
};

export const getAccMgmtListFromDB = async ({
  orderBy,
  pageSize = DEFAULT_PAGE_SIZE,
  curPage = DEFAULT_CURRENT_PAGE,
  enabledCurrenciesOnly = false,
}: SQLQueryOptions & { enabledCurrenciesOnly?: boolean }) => {
  try {
    const offset = (curPage - 1) * pageSize;
    const db = await getDB();

    const sql = `
      SELECT
        accounts.*,
        CASE WHEN currency_preferences.code IS NULL THEN 0 ELSE 1 END AS is_currency_enabled,
        account_types.label AS type_label,
        account_types.icon AS type_icon
      FROM accounts
      INNER JOIN account_types ON account_types.id = accounts.type_id
      LEFT JOIN currency_preferences
        ON currency_preferences.code = accounts.currency_code
      WHERE accounts.deleted_at IS NULL
      ${
        enabledCurrenciesOnly
          ? "AND currency_preferences.code IS NOT NULL AND accounts.is_active = 1"
          : ""
      }
      ${buildOrderBy(orderBy)}
      LIMIT ? OFFSET ?;
    `;

    const result = await db.getAllAsync<AccMgmtRspType>(sql, [
      pageSize,
      offset,
    ]);
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT_DB, "Loaded account page", {
      curPage,
      pageSize,
      count: result.length,
    });

    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT_DB,
      "Error when getting account list from db",
      e,
    );
    throw e;
  }
};

export const getAccMgmtByTypeCurrencyAndLabelFromDB = async (
  typeId: string,
  currencyCode: string,
  label: string,
): Promise<AccMgmtRspType | null> => {
  try {
    const db = await getDB();

    const result = await db.getFirstAsync<AccMgmtRspType>(
      `
        SELECT
          accounts.*,
          CASE WHEN currency_preferences.code IS NULL THEN 0 ELSE 1 END AS is_currency_enabled,
          account_types.label AS type_label,
          account_types.icon AS type_icon
        FROM accounts
        INNER JOIN account_types ON account_types.id = accounts.type_id
        LEFT JOIN currency_preferences
          ON currency_preferences.code = accounts.currency_code
        WHERE accounts.type_id = ?
          AND accounts.currency_code = ? COLLATE NOCASE
          AND accounts.label = ? COLLATE NOCASE
          AND accounts.deleted_at IS NULL;
      `,
      [typeId, currencyCode, label],
    );
    debugLog(
      DEBUG_TAG.ACCOUNT_MANAGEMENT_DB,
      "Checked account type, currency, and label",
      {
        typeId,
        currencyCode,
        label,
        found: Boolean(result),
      },
    );

    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT_DB,
      "Error when checking whether account type and label exists from db",
      e,
    );
    throw e;
  }
};

export const getAccMgmtByIdFromDB = async (
  id: string,
): Promise<AccMgmtRspType | null> => {
  try {
    const db = await getDB();

    const result = await db.getFirstAsync<AccMgmtRspType>(
      `
        SELECT
          accounts.*,
          CASE WHEN currency_preferences.code IS NULL THEN 0 ELSE 1 END AS is_currency_enabled,
          account_types.label AS type_label,
          account_types.icon AS type_icon
        FROM accounts
        INNER JOIN account_types ON account_types.id = accounts.type_id
        LEFT JOIN currency_preferences
          ON currency_preferences.code = accounts.currency_code
        WHERE accounts.id = ?
          AND accounts.deleted_at IS NULL;
      `,
      [id],
    );
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT_DB, "Loaded account by id", {
      id,
      found: Boolean(result),
    });

    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT_DB,
      "Error when getting account by id from db",
      e,
    );
    throw e;
  }
};

export const createNewAccMgmtToDB = async (data: AccMgmtCreateReqType) => {
  try {
    const db = await getDB();
    const id = randomUUID();
    const currentBalance = toCurrencyAmountNumber(
      data.currentBalance,
      data.currencyCode,
    );
    await db.runAsync(
      `
        INSERT INTO accounts (
          id,
          type_id,
          currency_code,
          label,
          descriptions,
          current_balance,
          is_main_account
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
      `,
      [
        id,
        data.typeId,
        data.currencyCode,
        data.label,
        data.descriptions || null,
        currentBalance,
        data.isMainAccount ? 1 : 0,
      ],
    );
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT_DB, "Created account", {
      id,
      label: data.label,
    });
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT_DB,
      "Error when creating new account into db",
      e,
    );
    throw e;
  }
};

export const updateAccMgmtToDB = async (data: AccMgmtUpdateReqType) => {
  try {
    const db = await getDB();
    const currentBalance = toCurrencyAmountNumber(
      data.currentBalance,
      data.currencyCode,
    );
    let balanceAdjustment = 0;

    await db.withTransactionAsync(async () => {
      const account = await db.getFirstAsync<{ current_balance: number }>(
        `
          SELECT current_balance
          FROM accounts
          WHERE id = ?
            AND deleted_at IS NULL;
        `,
        [data.id],
      );
      if (!account) throw new Error(`Account not found: ${data.id}`);

      balanceAdjustment = subtractAmounts(
        currentBalance,
        account.current_balance,
      );
      const result = await db.runAsync(
        `
          UPDATE accounts
          SET
            type_id = ?,
            currency_code = ?,
            label = ?,
            descriptions = ?,
            current_balance = ROUND(?, 3),
            is_main_account = ?,
            sync_status = ?,
            updated_at = datetime('now')
          WHERE id = ?
            AND deleted_at IS NULL;
        `,
        [
          data.typeId,
          data.currencyCode,
          data.label,
          data.descriptions || null,
          currentBalance,
          data.isMainAccount ? 1 : 0,
          DB_SYNC_STATUS.PENDING,
          data.id,
        ],
      );
      if (result.changes !== 1) {
        throw new Error(`Account not found: ${data.id}`);
      }

      if (compareAmounts(balanceAdjustment, 0) !== 0) {
        const balanceChangeKind = data.balanceChangeKind ?? "correction";
        const transactionType =
          balanceChangeKind === "correction"
            ? TXN_TYPE_ENUM.ADJUSTMENT
            : balanceChangeKind === "expense"
              ? TXN_TYPE_ENUM.EXPENSE
              : TXN_TYPE_ENUM.INCOME;
        const transactionAmount =
          transactionType === TXN_TYPE_ENUM.ADJUSTMENT
            ? balanceAdjustment
            : absoluteAmount(balanceAdjustment);
        const categoryId =
          transactionType === TXN_TYPE_ENUM.ADJUSTMENT
            ? null
            : (data.balanceChangeCategoryId ?? null);
        const description =
          transactionType === TXN_TYPE_ENUM.ADJUSTMENT
            ? "Balance correction"
            : `Missing ${transactionType} from balance reconciliation`;
        const adjustmentTransactionId = randomUUID();
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
            ) VALUES (?, ?, ?, ?, NULL, NULL, ?, 'main', ?, ?, ?, ?, ?, COALESCE(?, date('now', 'localtime')));
          `,
          [
            adjustmentTransactionId,
            transactionType,
            categoryId,
            data.id,
            adjustmentTransactionId,
            transactionAmount,
            data.currencyCode,
            data.currencyCode,
            transactionAmount,
            description,
            data.balanceChangeDate ?? null,
          ],
        );
      }
    });
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT_DB, "Updated account", {
      id: data.id,
      label: data.label,
      balanceAdjustment,
    });
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT_DB,
      "Error when updating account into db",
      e,
    );
    throw e;
  }
};

export const deleteAccMgmtFromDB = async (id: string) => {
  try {
    const db = await getDB();
    await db.runAsync(
      `
        UPDATE accounts
        SET
          deleted_at = datetime('now'),
          sync_status = ?,
          is_active = ?
        WHERE id = ?
          AND deleted_at IS NULL;
      `,
      [DB_SYNC_STATUS.PENDING, 0, id],
    );
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT_DB, "Deleted account", { id });
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT_DB,
      "Error when deleting account from DB",
      e,
    );
    throw e;
  }
};
