export type CurrencyPreferenceRow = {
  code: string;
  is_default: number;
};

export type CurrencyPreferences = {
  defaultCurrencyCode: string;
  enabledCurrencyCodes: string[];
  isSingleCurrency: boolean;
};
