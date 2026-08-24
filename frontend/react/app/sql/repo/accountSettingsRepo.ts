import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { getDB } from "../db/database";
import type { AccountSettingsType } from "../types/accountSettingsType";

export const getAccountSettingsFromDB = async () => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<AccountSettingsType>(
      `SELECT nickname, email, language
       FROM account_settings
       WHERE id = 1;`,
    );

    debugLog(DEBUG_TAG.ACCOUNT_SETTINGS_DB, "Loaded account settings", {
      found: Boolean(result),
    });
    return result;
  } catch (error) {
    console.error(
      DEBUG_TAG.ACCOUNT_SETTINGS_DB,
      "Error when loading account settings from db",
      error,
    );
    throw error;
  }
};

export const saveAccountSettingsToDB = async (data: AccountSettingsType) => {
  try {
    const db = await getDB();
    await db.runAsync(
      `INSERT INTO account_settings (id, nickname, email, language)
       VALUES (1, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         nickname = excluded.nickname,
         email = excluded.email,
         language = excluded.language,
         updated_at = datetime('now');`,
      [data.nickname, data.email, data.language],
    );

    debugLog(DEBUG_TAG.ACCOUNT_SETTINGS_DB, "Saved account settings");
  } catch (error) {
    console.error(
      DEBUG_TAG.ACCOUNT_SETTINGS_DB,
      "Error when saving account settings to db",
      error,
    );
    throw error;
  }
};
