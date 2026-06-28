import { DB_SYNC_STATUS } from "../../constants/enum";
import { getDB } from "../db/database";
import {
  AccTypCreateReqType,
  AccTypRspType,
  AccTypUpdateReqType,
} from "../types/accTypType";
import { randomUUID } from "expo-crypto";

export const getAccTypeListFromDB = async () => {
  try {
    const db = await getDB();

    const result = await db.getAllAsync<AccTypRspType>(`
    SELECT * FROM account_types WHERE deleted_at IS NULL;  
  `);
    return result;
  } catch (e) {
    console.error("Error when getting account type from db", e);
    throw e;
  }
};

export const getAccTypeByLabelFromDB = async (
  label: string,
): Promise<AccTypRspType | null> => {
  try {
    const db = await getDB();

    const result = await db.getFirstAsync<AccTypRspType>(
      "SELECT * FROM account_types WHERE label = ?  COLLATE NOCASE;",
      [label],
    );
    return result;
  } catch (e) {
    console.error(
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
      "SELECT * FROM account_types WHERE id = ?;",
      [id],
    );
    return result;
  } catch (e) {
    console.error("Error when getting account type by id from db", e);
    throw e;
  }
};

export const createNewAccTypeToDB = async (data: AccTypCreateReqType) => {
  try {
    const db = await getDB();
    await db.runAsync(
      `INSERT INTO account_types (id, label, icon) VALUES (?, ?, ?);`,
      [randomUUID(), data.label, data.icon],
    );
  } catch (e) {
    console.error("Error when creating new account type into db", e);
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
  } catch (e) {
    console.error("Error when creating new account type into db", e);
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
  } catch (e) {
    console.error("Error when deleting accout type from DB");
  }
};
