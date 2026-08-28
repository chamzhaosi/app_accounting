import { create } from "zustand";
import { CURRENCY_CODES, DEFAULT_CURRENCY_CODE } from "../constants/currencies";
import {
  getStoredItem,
  REPORTING_CURRENCY_KEY,
  setStoredItem,
} from "../local/secureStore";

type ReportingCurrencyState = {
  currencyCode: string;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setCurrencyCode: (currencyCode: string) => Promise<void>;
};

export const useReportingCurrencyStore = create<ReportingCurrencyState>()(
  (set) => ({
    currencyCode: DEFAULT_CURRENCY_CODE,
    isHydrated: false,
    hydrate: async () => {
      const storedCode = await getStoredItem(REPORTING_CURRENCY_KEY);
      set({
        currencyCode:
          storedCode && CURRENCY_CODES.has(storedCode)
            ? storedCode
            : DEFAULT_CURRENCY_CODE,
        isHydrated: true,
      });
    },
    setCurrencyCode: async (currencyCode) => {
      if (!CURRENCY_CODES.has(currencyCode)) return;
      set({ currencyCode });
      await setStoredItem(REPORTING_CURRENCY_KEY, currencyCode);
    },
  }),
);
