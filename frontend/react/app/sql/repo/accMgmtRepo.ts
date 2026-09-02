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
  AccountTypeBalanceTotalType,
} from "../types/accMgmtType";
import { SQLQueryOptions } from "../types/common";
import { randomUUID } from "expo-crypto";

export const getAssetBalanceFromDB = async (
  currencyCode: string,
): Promise<number> => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<{ balance: number }>(
      `
        SELECT ROUND(COALESCE(SUM(current_balance), 0), 3) AS balance
        FROM accounts
        WHERE is_asset = 1
          AND currency_code = ?
          AND deleted_at IS NULL;
      `,
      [currencyCode],
    );

    const balance = result?.balance ?? 0;
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT_DB, "Loaded asset balance", {
      balance,
      currencyCode,
    });

    return balance;
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT_DB,
      "Error when getting asset balance from db",
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
  includeInactive = true,
  currencyCode,
}: SQLQueryOptions & {
  enabledCurrenciesOnly?: boolean;
  includeInactive?: boolean;
  currencyCode?: string;
}) => {
  try {
    const offset = (curPage - 1) * pageSize;
    const db = await getDB();

    const sql = `
      SELECT
        accounts.*,
        CASE WHEN currency_preferences.code IS NULL THEN 0 ELSE 1 END AS is_currency_enabled,
        account_types.label AS type_label,
        account_types.icon AS type_icon,
        credit_card_settings.reminder_enabled AS credit_card_reminder_enabled,
        credit_card_settings.statement_day,
        credit_card_settings.due_day,
        credit_card_settings.reminder_lead_days,
        credit_card_settings.reminder_time,
        credit_card_settings.stop_condition AS reminder_stop_condition,
        credit_card_settings.first_cycle_mode AS reminder_first_cycle_mode
      FROM accounts
      INNER JOIN account_types ON account_types.id = accounts.type_id
      LEFT JOIN currency_preferences
        ON currency_preferences.code = accounts.currency_code
      LEFT JOIN credit_card_settings
        ON credit_card_settings.account_id = accounts.id
      WHERE accounts.deleted_at IS NULL
      ${includeInactive ? "" : "AND accounts.is_active = 1"}
      ${currencyCode ? "AND accounts.currency_code = ?" : ""}
      ${
        enabledCurrenciesOnly
          ? "AND currency_preferences.code IS NOT NULL AND accounts.is_active = 1"
          : ""
      }
      ${buildOrderBy(orderBy)}
      LIMIT ? OFFSET ?;
    `;

    const result = await db.getAllAsync<AccMgmtRspType>(sql, [
      ...(currencyCode ? [currencyCode] : []),
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

export const getAccountTypeBalanceTotalsFromDB = async (): Promise<
  AccountTypeBalanceTotalType[]
> => {
  try {
    const db = await getDB();
    const result = await db.getAllAsync<AccountTypeBalanceTotalType>(
      `WITH currency_totals AS (
         SELECT
           type_id,
           currency_code,
           COUNT(*) AS currency_account_count,
           ROUND(COALESCE(SUM(
             CASE WHEN is_asset = 1 THEN current_balance ELSE 0 END
           ), 0), 3) AS balance
         FROM accounts
         WHERE deleted_at IS NULL
         GROUP BY type_id, currency_code
       )
       SELECT
         type_id,
         currency_code,
         balance,
         currency_account_count,
         SUM(currency_account_count) OVER (PARTITION BY type_id) AS account_count
       FROM currency_totals
       ORDER BY currency_code ASC;`,
    );
    debugLog(
      DEBUG_TAG.ACCOUNT_MANAGEMENT_DB,
      "Loaded account type balance totals",
      { count: result.length },
    );
    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT_DB,
      "Error when getting account type balance totals from db",
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
          account_types.icon AS type_icon,
          credit_card_settings.reminder_enabled AS credit_card_reminder_enabled,
          credit_card_settings.statement_day,
          credit_card_settings.due_day,
          credit_card_settings.reminder_lead_days,
          credit_card_settings.reminder_time,
          credit_card_settings.stop_condition AS reminder_stop_condition,
          credit_card_settings.first_cycle_mode AS reminder_first_cycle_mode
        FROM accounts
        INNER JOIN account_types ON account_types.id = accounts.type_id
        LEFT JOIN currency_preferences
          ON currency_preferences.code = accounts.currency_code
        LEFT JOIN credit_card_settings
          ON credit_card_settings.account_id = accounts.id
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
          account_types.icon AS type_icon,
          credit_card_settings.reminder_enabled AS credit_card_reminder_enabled,
          credit_card_settings.statement_day,
          credit_card_settings.due_day,
          credit_card_settings.reminder_lead_days,
          credit_card_settings.reminder_time,
          credit_card_settings.stop_condition AS reminder_stop_condition,
          credit_card_settings.first_cycle_mode AS reminder_first_cycle_mode
        FROM accounts
        INNER JOIN account_types ON account_types.id = accounts.type_id
        LEFT JOIN currency_preferences
          ON currency_preferences.code = accounts.currency_code
        LEFT JOIN credit_card_settings
          ON credit_card_settings.account_id = accounts.id
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
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
        INSERT INTO accounts (
          id,
          type_id,
          currency_code,
          label,
          descriptions,
          current_balance,
          is_active,
          is_asset
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `,
        [
          id,
          data.typeId,
          data.currencyCode,
          data.label,
          data.descriptions || null,
          currentBalance,
          data.isActive ? 1 : 0,
          data.isAsset ? 1 : 0,
        ],
      );
      await saveCreditCardConfiguration(db, id, data);
    });
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
            is_active = ?,
            is_asset = ?,
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
          data.isActive ? 1 : 0,
          data.isAsset ? 1 : 0,
          DB_SYNC_STATUS.PENDING,
          data.id,
        ],
      );
      if (result.changes !== 1) {
        throw new Error(`Account not found: ${data.id}`);
      }

      await saveCreditCardConfiguration(db, data.id, data);

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
            : data.balanceChangeDescription?.trim() ||
              `Missing ${transactionType} from balance reconciliation`;
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

const getCycleDate = (year: number, month: number, day: number) =>
  new Date(year, month + 1, 0).getDate() < day
    ? new Date(year, month + 1, 0)
    : new Date(year, month, day);

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const saveCreditCardConfiguration = async (
  db: Awaited<ReturnType<typeof getDB>>,
  accountId: string,
  data: AccMgmtCreateReqType,
) => {
  const type = await db.getFirstAsync<{ label: string; is_system: boolean }>(
    "SELECT label, is_system FROM account_types WHERE id = ? AND deleted_at IS NULL;",
    [data.typeId],
  );
  const isCreditCard = Boolean(
    type?.is_system && type.label.toLowerCase() === "credit card",
  );
  if (!isCreditCard) {
    await db.runAsync(
      "UPDATE credit_card_settings SET reminder_enabled = 0, updated_at = datetime('now') WHERE account_id = ?;",
      [accountId],
    );
    return;
  }

  await db.runAsync(
    `INSERT INTO credit_card_settings (
       account_id, reminder_enabled, statement_day, due_day,
       reminder_lead_days, reminder_time, stop_condition, first_cycle_mode
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(account_id) DO UPDATE SET
       reminder_enabled = excluded.reminder_enabled,
       statement_day = excluded.statement_day,
       due_day = excluded.due_day,
       reminder_lead_days = excluded.reminder_lead_days,
       reminder_time = excluded.reminder_time,
       stop_condition = excluded.stop_condition,
       first_cycle_mode = excluded.first_cycle_mode,
       updated_at = datetime('now');`,
    [
      accountId,
      data.reminderEnabled ? 1 : 0,
      Number(data.statementDay),
      Number(data.dueDay),
      Number(data.reminderLeadDays),
      data.reminderTime,
      data.reminderStopCondition,
      data.firstCycleMode,
    ],
  );

  if (
    data.reminderEnabled &&
    data.firstCycleMode === "current" &&
    data.currentCycleDueDate
  ) {
    const due = new Date(`${data.currentCycleDueDate}T00:00:00`);
    let statement = getCycleDate(
      due.getFullYear(),
      due.getMonth(),
      Number(data.statementDay),
    );
    if (statement >= due) {
      statement = getCycleDate(
        due.getFullYear(),
        due.getMonth() - 1,
        Number(data.statementDay),
      );
    }
    const periodStart = getCycleDate(
      statement.getFullYear(),
      statement.getMonth() - 1,
      Number(data.statementDay),
    );
    const amount = toCurrencyAmountNumber(
      data.currentCycleRemainingDue,
      data.currencyCode,
    );
    await db.runAsync(
      `INSERT INTO credit_card_cycles (
         id, account_id, period_start, statement_date, due_date,
         statement_amount, remaining_due, status, is_manual_initial
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
       ON CONFLICT(account_id, statement_date) DO UPDATE SET
         period_start = excluded.period_start,
         due_date = excluded.due_date,
         statement_amount = excluded.statement_amount,
         remaining_due = excluded.remaining_due,
         status = excluded.status,
         is_manual_initial = 1,
         updated_at = datetime('now');`,
      [
        randomUUID(),
        accountId,
        toDateKey(periodStart),
        toDateKey(statement),
        data.currentCycleDueDate,
        amount,
        amount,
        compareAmounts(amount, 0) > 0 ? "pending" : "paid",
      ],
    );
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
