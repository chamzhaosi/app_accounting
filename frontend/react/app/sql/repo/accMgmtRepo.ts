import { DB_SYNC_STATUS } from "../../constants/enum";
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

const toDbAmount = (value?: string) => Number(value || 0);

export const getMainAccountBalanceFromDB = async (): Promise<number> => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<{ balance: number }>(
      `
        SELECT COALESCE(SUM(current_balance), 0) AS balance
        FROM accounts
        WHERE is_main_account = 1
          AND is_active = 1
          AND deleted_at IS NULL;
      `,
    );

    const balance = result?.balance ?? 0;
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT_DB, "Loaded main account balance", {
      balance,
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
}: SQLQueryOptions) => {
  try {
    const offset = (curPage - 1) * pageSize;
    const db = await getDB();

    const sql = `
      SELECT
        accounts.*,
        account_types.label AS type_label,
        account_types.icon AS type_icon
      FROM accounts
      INNER JOIN account_types ON account_types.id = accounts.type_id
      WHERE accounts.deleted_at IS NULL
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

export const getAccMgmtByTypeAndLabelFromDB = async (
  typeId: string,
  label: string,
): Promise<AccMgmtRspType | null> => {
  try {
    const db = await getDB();

    const result = await db.getFirstAsync<AccMgmtRspType>(
      `
        SELECT
          accounts.*,
          account_types.label AS type_label,
          account_types.icon AS type_icon
        FROM accounts
        INNER JOIN account_types ON account_types.id = accounts.type_id
        WHERE accounts.type_id = ?
          AND accounts.label = ? COLLATE NOCASE
          AND accounts.deleted_at IS NULL;
      `,
      [typeId, label],
    );
    debugLog(
      DEBUG_TAG.ACCOUNT_MANAGEMENT_DB,
      "Checked account type and label",
      {
        typeId,
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
          account_types.label AS type_label,
          account_types.icon AS type_icon
        FROM accounts
        INNER JOIN account_types ON account_types.id = accounts.type_id
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
    const initialValue = toDbAmount(data.initialValue);
    await db.runAsync(
      `
        INSERT INTO accounts (
          id,
          type_id,
          label,
          descriptions,
          initial_value,
          current_balance,
          is_main_account
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
      `,
      [
        id,
        data.typeId,
        data.label,
        data.descriptions || null,
        initialValue,
        initialValue,
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
    const initialValue = toDbAmount(data.initialValue);
    await db.runAsync(
      `
        UPDATE accounts
        SET
          type_id = ?,
          label = ?,
          descriptions = ?,
          current_balance = ROUND(current_balance + (? - initial_value), 2),
          initial_value = ?,
          is_main_account = ?,
          sync_status = ?,
          updated_at = datetime('now')
        WHERE id = ?
          AND deleted_at IS NULL;
      `,
      [
        data.typeId,
        data.label,
        data.descriptions || null,
        initialValue,
        initialValue,
        data.isMainAccount ? 1 : 0,
        DB_SYNC_STATUS.PENDING,
        data.id,
      ],
    );
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT_DB, "Updated account", {
      id: data.id,
      label: data.label,
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
