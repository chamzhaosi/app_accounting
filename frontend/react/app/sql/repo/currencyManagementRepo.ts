import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { getMonthKey } from "../../utils/date";
import { getDB } from "../db/database";
import { deactivateBudgetsForCurrenciesWithDB } from "./budgetRepo";
import type {
  CurrencyPreferenceRow,
  CurrencyPreferences,
} from "../types/currencyManagementType";

export const getCurrencyPreferencesFromDB = async () => {
  try {
    const db = await getDB();
    const rows = await db.getAllAsync<CurrencyPreferenceRow>(
      `SELECT code, is_default
       FROM currency_preferences
       ORDER BY is_default DESC, code ASC;`,
    );

    debugLog(DEBUG_TAG.CURRENCY_MANAGEMENT_DB, "Loaded currency preferences", {
      count: rows.length,
    });
    return rows;
  } catch (error) {
    console.error(
      DEBUG_TAG.CURRENCY_MANAGEMENT_DB,
      "Error when loading currency preferences from db",
      error,
    );
    throw error;
  }
};

export const saveCurrencyPreferencesToDB = async (
  data: CurrencyPreferences,
  disabledCurrencyCodes: string[] = [],
) => {
  try {
    const db = await getDB();
    await db.withTransactionAsync(async () => {
      await deactivateBudgetsForCurrenciesWithDB(
        db,
        disabledCurrencyCodes,
        getMonthKey(),
      );
      await db.runAsync("DELETE FROM currency_preferences;");

      for (const code of data.enabledCurrencyCodes) {
        await db.runAsync(
          `INSERT INTO currency_preferences (code, is_default)
           VALUES (?, ?);`,
          [code, code === data.defaultCurrencyCode ? 1 : 0],
        );
      }
    });

    debugLog(DEBUG_TAG.CURRENCY_MANAGEMENT_DB, "Saved currency preferences", {
      count: data.enabledCurrencyCodes.length,
      defaultCurrencyCode: data.defaultCurrencyCode,
    });
  } catch (error) {
    console.error(
      DEBUG_TAG.CURRENCY_MANAGEMENT_DB,
      "Error when saving currency preferences to db",
      error,
    );
    throw error;
  }
};
