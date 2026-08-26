import { CURRENCY_CODES } from "../../constants/currencies";
import {
  getCurrencyPreferencesFromDB,
  saveCurrencyPreferencesToDB,
} from "../repo/currencyManagementRepo";
import type { CurrencyPreferences } from "../types/currencyManagementType";

export const getCurrencyPreferences =
  async (): Promise<CurrencyPreferences | null> => {
    const rows = await getCurrencyPreferencesFromDB();
    const defaultCurrency = rows.find((row) => row.is_default === 1);

    if (!defaultCurrency) return null;

    return {
      defaultCurrencyCode: defaultCurrency.code,
      enabledCurrencyCodes: rows.map(({ code }) => code),
    };
  };

export const saveCurrencyPreferences = async (data: CurrencyPreferences) => {
  const enabledCurrencyCodes = [...new Set(data.enabledCurrencyCodes)].sort();

  if (!CURRENCY_CODES.has(data.defaultCurrencyCode)) {
    return "Please select a valid default currency.";
  }

  if (enabledCurrencyCodes.some((code) => !CURRENCY_CODES.has(code))) {
    return "One or more selected currencies are invalid.";
  }

  if (!enabledCurrencyCodes.includes(data.defaultCurrencyCode)) {
    return "The default currency must be enabled.";
  }

  await saveCurrencyPreferencesToDB({
    defaultCurrencyCode: data.defaultCurrencyCode,
    enabledCurrencyCodes,
  });
  return null;
};
