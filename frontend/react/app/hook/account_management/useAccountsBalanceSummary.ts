import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { accountManagementQueryKeys } from "../../constants/queryKeys";
import type { AppCurrencyTotal } from "../../components/AppCurrencyTotalsSheet";
import { getAccountTypeBalanceTotals } from "../../sql/service/accMgmtService";
import { sumAmounts } from "../../utils/amount";
import { DEBUG_TAG } from "../../utils/debugLog";

type UseAccountsBalanceSummaryProps = {
  selectedCurrencyCode: string | null;
  onSelectedCurrencyChange: (currencyCode: string | null) => void;
};

export default function useAccountsBalanceSummary({
  selectedCurrencyCode,
  onSelectedCurrencyChange,
}: UseAccountsBalanceSummaryProps) {
  const totalsQuery = useQuery({
    queryKey: accountManagementQueryKeys.typeBalanceTotals(),
    queryFn: getAccountTypeBalanceTotals,
  });
  const currencyTotals = useMemo<AppCurrencyTotal[]>(
    () =>
      Array.from(
        (totalsQuery.data ?? []).reduce((totals, total) => {
          const amounts = totals.get(total.currency_code) ?? [];
          amounts.push(total.balance);
          totals.set(total.currency_code, amounts);
          return totals;
        }, new Map<string, number[]>()),
      )
        .map(([currencyCode, amounts]) => ({
          currencyCode,
          amount: sumAmounts(amounts),
        }))
        .sort((left, right) =>
          left.currencyCode.localeCompare(right.currencyCode),
        ),
    [totalsQuery.data],
  );
  const currencyCodes = useMemo(
    () => currencyTotals.map((total) => total.currencyCode),
    [currencyTotals],
  );
  const selectorOptions = useMemo<(string | null)[]>(
    () => [
      null,
      ...currencyCodes,
      ...(selectedCurrencyCode && !currencyCodes.includes(selectedCurrencyCode)
        ? [selectedCurrencyCode]
        : []),
    ],
    [currencyCodes, selectedCurrencyCode],
  );

  const selectedIndex = selectorOptions.indexOf(selectedCurrencyCode);
  const selectedBalance = selectedCurrencyCode
    ? (currencyTotals.find(
        (total) => total.currencyCode === selectedCurrencyCode,
      )?.amount ?? 0)
    : 0;

  const selectOption = (option: string | null | undefined) => {
    if (option === undefined) return;
    onSelectedCurrencyChange(option);
  };

  useEffect(() => {
    if (!totalsQuery.error) return;
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when loading account currencies",
      totalsQuery.error,
    );
  }, [totalsQuery.error]);

  return {
    balance: selectedBalance,
    canSelectNextCurrency: selectedIndex < selectorOptions.length - 1,
    canSelectPreviousCurrency: selectedIndex > 0,
    currencyCode: selectedCurrencyCode,
    currencyTotals,
    hasAccountCurrencies: currencyCodes.length > 0,
    isAllCurrencies: selectedCurrencyCode === null,
    isLoading: totalsQuery.isLoading,
    nextCurrency: () => {
      selectOption(selectorOptions[selectedIndex + 1]);
    },
    previousCurrency: () => {
      selectOption(selectorOptions[selectedIndex - 1]);
    },
  };
}
