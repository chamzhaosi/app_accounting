import { create } from "zustand";
import {
  ALL_CURRENCIES_VALUE,
  CURRENCY_CODES,
  DEFAULT_CURRENCY_CODE,
} from "../constants/currencies";
import {
  getStoredItem,
  getBookReportingCurrencyKey,
  getBookReportingCurrencySelectionKey,
  REPORTING_CURRENCY_KEY,
  REPORTING_CURRENCY_SELECTION_KEY,
  setStoredItem,
} from "../local/secureStore";

type ReportingCurrencyState = {
  bookId: string | null;
  currencyCode: string;
  currencySelection: string;
  isHydrated: boolean;
  hydrate: (
    bookId: string,
    defaultCurrencyCode: string,
    enabledCurrencyCodes: string[],
  ) => Promise<void>;
  setCurrencyCode: (currencyCode: string) => Promise<void>;
  setCurrencySelection: (selection: string) => Promise<void>;
};

export const useReportingCurrencyStore = create<ReportingCurrencyState>()(
  (set, get) => ({
    bookId: null,
    currencyCode: DEFAULT_CURRENCY_CODE,
    currencySelection: ALL_CURRENCIES_VALUE,
    isHydrated: false,
    hydrate: async (bookId, defaultCurrencyCode, enabledCurrencyCodes) => {
      set({
        bookId,
        currencyCode: defaultCurrencyCode,
        currencySelection: ALL_CURRENCIES_VALUE,
        isHydrated: false,
      });
      const [bookCode, bookSelection, legacyCode, legacySelection] =
        await Promise.all([
          getStoredItem(getBookReportingCurrencyKey(bookId)),
          getStoredItem(getBookReportingCurrencySelectionKey(bookId)),
          getStoredItem(REPORTING_CURRENCY_KEY),
          getStoredItem(REPORTING_CURRENCY_SELECTION_KEY),
        ]);
      const storedCode = bookCode ?? legacyCode;
      const storedSelection = bookSelection ?? legacySelection;
      const enabledCodes = new Set(enabledCurrencyCodes);
      const currencyCode =
        storedCode && enabledCodes.has(storedCode)
          ? storedCode
          : defaultCurrencyCode;
      const currencySelection =
        storedSelection === ALL_CURRENCIES_VALUE
          ? ALL_CURRENCIES_VALUE
          : storedSelection && enabledCodes.has(storedSelection)
            ? storedSelection
            : ALL_CURRENCIES_VALUE;

      if (get().bookId !== bookId) return;

      set({ currencyCode, currencySelection, isHydrated: true });
      await Promise.all([
        setStoredItem(getBookReportingCurrencyKey(bookId), currencyCode),
        setStoredItem(
          getBookReportingCurrencySelectionKey(bookId),
          currencySelection,
        ),
      ]);
    },
    setCurrencyCode: async (currencyCode) => {
      if (!CURRENCY_CODES.has(currencyCode)) return;
      set({ currencyCode });
      const bookId = get().bookId;
      if (!bookId) return;
      await setStoredItem(getBookReportingCurrencyKey(bookId), currencyCode);
    },
    setCurrencySelection: async (selection) => {
      if (selection === ALL_CURRENCIES_VALUE) {
        set({ currencySelection: selection });
        const bookId = get().bookId;
        if (!bookId) return;
        await setStoredItem(
          getBookReportingCurrencySelectionKey(bookId),
          selection,
        );
        return;
      }
      if (!CURRENCY_CODES.has(selection)) return;
      set({ currencyCode: selection, currencySelection: selection });
      const bookId = get().bookId;
      if (!bookId) return;
      await Promise.all([
        setStoredItem(getBookReportingCurrencyKey(bookId), selection),
        setStoredItem(getBookReportingCurrencySelectionKey(bookId), selection),
      ]);
    },
  }),
);
