import { create } from "zustand";
import {
  ALL_CURRENCIES_VALUE,
  CURRENCY_CODES,
  DEFAULT_CURRENCY_CODE,
} from "../constants/currencies";
import {
  getStoredItem,
  REPORTING_CURRENCY_KEY,
  REPORTING_CURRENCY_SELECTION_KEY,
  setStoredItem,
} from "../local/secureStore";

type ReportingCurrencyState = {
  currencyCode: string;
  currencySelection: string;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setCurrencyCode: (currencyCode: string) => Promise<void>;
  setCurrencySelection: (selection: string) => Promise<void>;
};

export const useReportingCurrencyStore = create<ReportingCurrencyState>()(
  (set) => ({
    currencyCode: DEFAULT_CURRENCY_CODE,
    currencySelection: ALL_CURRENCIES_VALUE,
    isHydrated: false,
    hydrate: async () => {
      const [storedCode, storedSelection] = await Promise.all([
        getStoredItem(REPORTING_CURRENCY_KEY),
        getStoredItem(REPORTING_CURRENCY_SELECTION_KEY),
      ]);
      const currencyCode =
        storedCode && CURRENCY_CODES.has(storedCode)
          ? storedCode
          : DEFAULT_CURRENCY_CODE;
      set({
        currencyCode,
        currencySelection:
          storedSelection === ALL_CURRENCIES_VALUE ||
          (storedSelection && CURRENCY_CODES.has(storedSelection))
            ? storedSelection
            : ALL_CURRENCIES_VALUE,
        isHydrated: true,
      });
    },
    setCurrencyCode: async (currencyCode) => {
      if (!CURRENCY_CODES.has(currencyCode)) return;
      set({ currencyCode });
      await setStoredItem(REPORTING_CURRENCY_KEY, currencyCode);
    },
    setCurrencySelection: async (selection) => {
      if (selection === ALL_CURRENCIES_VALUE) {
        set({ currencySelection: selection });
        await setStoredItem(REPORTING_CURRENCY_SELECTION_KEY, selection);
        return;
      }
      if (!CURRENCY_CODES.has(selection)) return;
      set({ currencyCode: selection, currencySelection: selection });
      await Promise.all([
        setStoredItem(REPORTING_CURRENCY_KEY, selection),
        setStoredItem(REPORTING_CURRENCY_SELECTION_KEY, selection),
      ]);
    },
  }),
);
