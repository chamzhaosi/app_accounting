import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { CURRENCY_CODES } from "../../constants/currencies";
import { transactionManagementQueryKeys } from "../../constants/queryKeys";
import { getTransactionPeriodCurrencyCodes } from "../../sql/service/transactionMgmtService";
import { DEBUG_TAG } from "../../utils/debugLog";
import useCurrencyPreferenceOptions from "../currency_management/useCurrencyPreferenceOptions";

export default function usePeriodCurrencyCodes(
  startDate: string,
  endDate: string,
  options: {
    categoryId?: string;
    pendingCurrencyCode?: string;
  } = {},
) {
  const { categoryId, pendingCurrencyCode } = options;
  const { defaultCurrencyCode, enabledCurrencyCodes } =
    useCurrencyPreferenceOptions();
  const query = useQuery({
    queryKey: transactionManagementQueryKeys.periodCurrencyCodes({
      startDate,
      endDate,
      categoryId,
    }),
    queryFn: () =>
      getTransactionPeriodCurrencyCodes(startDate, endDate, categoryId),
    enabled: Boolean(startDate && endDate),
  });

  useEffect(() => {
    if (!query.error) return;
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Error when loading transaction period currencies",
      query.error,
    );
  }, [query.error]);

  const currencyCodes = useMemo(() => {
    const codes = new Set(enabledCurrencyCodes);
    query.data?.forEach((code) => codes.add(code));
    if (
      !query.isFetched &&
      pendingCurrencyCode &&
      CURRENCY_CODES.has(pendingCurrencyCode)
    )
      codes.add(pendingCurrencyCode);
    return Array.from(codes).sort(
      (left, right) =>
        Number(right === defaultCurrencyCode) -
          Number(left === defaultCurrencyCode) || left.localeCompare(right),
    );
  }, [
    defaultCurrencyCode,
    enabledCurrencyCodes,
    pendingCurrencyCode,
    query.data,
    query.isFetched,
  ]);

  return { currencyCodes, isFetched: query.isFetched };
}
