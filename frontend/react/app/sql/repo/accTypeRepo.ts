import { DB_SYNC_STATUS } from "../../constants/enum";
import {
  buildOrderBy,
  DEFAULT_PAGE_SIZE,
  DEFAULT_CURRENT_PAGE,
} from "../db/common";
import { getDB } from "../db/database";
import {
  AccTypCreateReqType,
  AccTypRspType,
  AccTypUpdateReqType,
} from "../types/accTypType";
import { randomUUID } from "expo-crypto";
import { SQLQueryOptions } from "../types/common";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

export const getAccTypeListFromDB = async ({
  orderBy,
  pageSize = DEFAULT_PAGE_SIZE,
  curPage = DEFAULT_CURRENT_PAGE,
}: SQLQueryOptions) => {
  try {
    const offset = (curPage - 1) * pageSize;
    const db = await getDB();

    const sql = `
      SELECT *
      FROM account_types
      WHERE deleted_at IS NULL
      ${buildOrderBy(orderBy)}
      LIMIT ? OFFSET ?;
    `;

    const result = await db.getAllAsync<AccTypRspType>(sql, [pageSize, offset]);
    debugLog(DEBUG_TAG.ACCOUNT_TYPE_DB, "Loaded account type page", {
      curPage,
      pageSize,
      count: result.length,
    });

    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_TYPE_DB,
      "Error when getting account type from db",
      e,
    );
    throw e;
  }
};

export const getAccTypeByLabelFromDB = async (
  label: string,
): Promise<AccTypRspType | null> => {
  try {
    const db = await getDB();

    const result = await db.getFirstAsync<AccTypRspType>(
      "SELECT * FROM account_types WHERE label = ? COLLATE NOCASE AND deleted_at IS NULL;",
      [label],
    );
    debugLog(DEBUG_TAG.ACCOUNT_TYPE_DB, "Checked account type label", {
      label,
      found: Boolean(result),
    });
    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_TYPE_DB,
      "Error when checking whether label of account type exist from db",
      e,
    );
    throw e;
  }
};

export const getAccTypeByIdFromDB = async (id: string) => {
  try {
    const db = await getDB();

    const result = await db.getFirstAsync<AccTypRspType>(
      "SELECT * FROM account_types WHERE id = ? AND deleted_at IS NULL;",
      [id],
    );
    debugLog(DEBUG_TAG.ACCOUNT_TYPE_DB, "Loaded account type by id", {
      id,
      found: Boolean(result),
    });
    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_TYPE_DB,
      "Error when getting account type by id from db",
      e,
    );
    throw e;
  }
};

export const createNewAccTypeToDB = async (data: AccTypCreateReqType) => {
  try {
    const db = await getDB();
    const id = randomUUID();
    await db.runAsync(
      `INSERT INTO account_types (id, label, icon) VALUES (?, ?, ?);`,
      [id, data.label, data.icon],
    );
    debugLog(DEBUG_TAG.ACCOUNT_TYPE_DB, "Created account type", {
      id,
      label: data.label,
    });
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_TYPE_DB,
      "Error when creating new account type into db",
      e,
    );
    throw e;
  }
};

export const updateAccTypeToDB = async (data: AccTypUpdateReqType) => {
  try {
    const db = await getDB();
    await db.runAsync(
      `UPDATE account_types SET label = ?, icon = ?, sync_status = ?, updated_at = datetime('now') WHERE id = ?;`,
      [data.label, data.icon, DB_SYNC_STATUS.PENDING, data.id],
    );
    debugLog(DEBUG_TAG.ACCOUNT_TYPE_DB, "Updated account type", {
      id: data.id,
      label: data.label,
    });
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_TYPE_DB,
      "Error when updating account type into db",
      e,
    );
    throw e;
  }
};

export const deleteAccTypeFromDB = async (id: string) => {
  try {
    const db = await getDB();
    await db.runAsync(
      `UPDATE account_types SET  deleted_at = datetime('now'), sync_status = ?, is_active = ? WHERE id = ?;`,
      [DB_SYNC_STATUS.PENDING, 0, id],
    );
    debugLog(DEBUG_TAG.ACCOUNT_TYPE_DB, "Deleted account type", { id });
  } catch (e) {
    console.error(
      DEBUG_TAG.ACCOUNT_TYPE_DB,
      "Error when deleting account type from DB",
      e,
    );
    throw e;
  }
};
