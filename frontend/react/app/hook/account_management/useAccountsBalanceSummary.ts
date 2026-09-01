import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { accountManagementQueryKeys } from "../../constants/queryKeys";
import {
  getAccountTypeBalanceTotals,
  getAssetBalance,
} from "../../sql/service/accMgmtService";
import { useReportingCurrencyStore } from "../../stores/useReportingCurrencyStore";
import { DEBUG_TAG } from "../../utils/debugLog";

export default function useAccountsBalanceSummary() {
  const currencyCode = useReportingCurrencyStore((state) => state.currencyCode);
  const isReportingCurrencyHydrated = useReportingCurrencyStore(
    (state) => state.isHydrated,
  );
  const setCurrencyCode = useReportingCurrencyStore(
    (state) => state.setCurrencyCode,
  );
  const totalsQuery = useQuery({
    queryKey: accountManagementQueryKeys.typeBalanceTotals(),
    queryFn: getAccountTypeBalanceTotals,
  });
  const currencyCodes = useMemo(
    () =>
      Array.from(
        new Set(totalsQuery.data?.map((total) => total.currency_code) ?? []),
      ).sort((left, right) => left.localeCompare(right)),
    [totalsQuery.data],
  );

  useEffect(() => {
    if (
      !isReportingCurrencyHydrated ||
      !totalsQuery.isFetched ||
      currencyCodes.length === 0 ||
      currencyCodes.includes(currencyCode)
    )
      return;
    void setCurrencyCode(currencyCodes[0]);
  }, [
    currencyCode,
    currencyCodes,
    isReportingCurrencyHydrated,
    setCurrencyCode,
    totalsQuery.isFetched,
  ]);

  const currencyIndex = currencyCodes.indexOf(currencyCode);
  const balanceQuery = useQuery({
    queryKey: accountManagementQueryKeys.assetBalance(currencyCode),
    queryFn: () => getAssetBalance(currencyCode),
    enabled: currencyIndex >= 0,
  });

  useEffect(() => {
    if (!totalsQuery.error) return;
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when loading account currencies",
      totalsQuery.error,
    );
  }, [totalsQuery.error]);

  useEffect(() => {
    if (!balanceQuery.error) return;
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when loading accounts asset balance",
      balanceQuery.error,
    );
  }, [balanceQuery.error]);

  return {
    balance: balanceQuery.data ?? 0,
    canSelectNextCurrency:
      currencyIndex >= 0 && currencyIndex < currencyCodes.length - 1,
    canSelectPreviousCurrency: currencyIndex > 0,
    currencyCode,
    hasAccountCurrencies: currencyCodes.length > 0,
    isLoading: totalsQuery.isLoading || balanceQuery.isLoading,
    nextCurrency: () => {
      const next = currencyCodes[currencyIndex + 1];
      if (next) void setCurrencyCode(next);
    },
    previousCurrency: () => {
      const previous = currencyCodes[currencyIndex - 1];
      if (previous) void setCurrencyCode(previous);
    },
  };
}
