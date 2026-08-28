import { CURRENCY_CODES } from "../../constants/currencies";
import {
  getCurrencyPreferencesFromDB,
  getUsedCurrencyCodesFromDB,
  saveCurrencyPreferencesToDB,
} from "../repo/currencyManagementRepo";
import type { CurrencyPreferences } from "../types/currencyManagementType";

export const getCurrencyPreferences =
  async (): Promise<CurrencyPreferences | null> => {
    const [rows, usedCurrencyCodes] = await Promise.all([
      getCurrencyPreferencesFromDB(),
      getUsedCurrencyCodesFromDB(),
    ]);
    const defaultCurrency = rows.find((row) => row.is_default === 1);

    if (!defaultCurrency) return null;

    const enabledCurrencyCodes = rows.map(({ code }) => code);
    const knownCurrencyCodes = new Set([
      ...enabledCurrencyCodes,
      ...usedCurrencyCodes,
    ]);
    return {
      defaultCurrencyCode: defaultCurrency.code,
      enabledCurrencyCodes,
      isSingleCurrency:
        enabledCurrencyCodes.length === 1 && knownCurrencyCodes.size === 1,
    };
  };

export const saveCurrencyPreferences = async (
  data: Omit<CurrencyPreferences, "isSingleCurrency">,
) => {
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

  const existingRows = await getCurrencyPreferencesFromDB();
  const disabledCurrencyCodes = existingRows
    .map(({ code }) => code)
    .filter((code) => !enabledCurrencyCodes.includes(code));

  await saveCurrencyPreferencesToDB(
    {
      defaultCurrencyCode: data.defaultCurrencyCode,
      enabledCurrencyCodes,
    },
    disabledCurrencyCodes,
  );
  return null;
};
