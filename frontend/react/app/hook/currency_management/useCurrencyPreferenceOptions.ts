import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import type { SelectOptionType } from "../../components/AppSelect";
import { CURRENCIES, DEFAULT_CURRENCY_CODE } from "../../constants/currencies";
import { currencyManagementQueryKeys } from "../../constants/queryKeys";
import { getCurrencyPreferences } from "../../sql/service/currencyManagementService";
import { DEBUG_TAG } from "../../utils/debugLog";

export default function useCurrencyPreferenceOptions(
  additionalCurrencyCode?: string,
) {
  const query = useQuery({
    queryKey: currencyManagementQueryKeys.preferences(),
    queryFn: getCurrencyPreferences,
  });

  useEffect(() => {
    if (!query.error) return;
    console.error(
      DEBUG_TAG.CURRENCY_MANAGEMENT,
      "Error when loading currency options",
      query.error,
    );
  }, [query.error]);

  const defaultCurrencyCode =
    query.data?.defaultCurrencyCode ?? DEFAULT_CURRENCY_CODE;
  const enabledCurrencyCodes = query.data?.enabledCurrencyCodes ?? [
    DEFAULT_CURRENCY_CODE,
  ];
  const currencyOptions = useMemo<SelectOptionType[]>(() => {
    const enabledCodes = new Set(enabledCurrencyCodes);
    return CURRENCIES.filter(
      ({ code }) => enabledCodes.has(code) || code === additionalCurrencyCode,
    )
      .sort(
        (left, right) =>
          Number(right.code === defaultCurrencyCode) -
            Number(left.code === defaultCurrencyCode) ||
          left.code.localeCompare(right.code),
      )
      .map((currency) => ({
        id: currency.code,
        label: `${currency.code} · ${currency.name} (${currency.symbol})`,
        value: currency.code,
      }));
  }, [additionalCurrencyCode, defaultCurrencyCode, enabledCurrencyCodes]);

  return {
    currencyOptions,
    defaultCurrencyCode,
    enabledCurrencyCodes: currencyOptions.map(({ value }) => value),
    isFetched: query.isFetched,
    showCurrencyField: enabledCurrencyCodes.length > 1,
  };
}
