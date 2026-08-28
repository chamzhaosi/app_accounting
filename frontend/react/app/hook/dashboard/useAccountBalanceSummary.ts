import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  accountManagementQueryKeys,
  currencyManagementQueryKeys,
  transactionManagementQueryKeys,
} from "../../constants/queryKeys";
import { getMainAccountBalance } from "../../sql/service/accMgmtService";
import { getTransactionDateRangeTotals } from "../../sql/service/transactionMgmtService";
import { DEBUG_TAG } from "../../utils/debugLog";
import useBudgetDailyRemaining from "./useBudgetDailyRemaining";
import { useReportingCurrencyStore } from "../../stores/useReportingCurrencyStore";
import { getCurrencyPreferences } from "../../sql/service/currencyManagementService";

export default function useAccountBalanceSummary(
  startDate: string,
  endDate: string,
) {
  const currencyCode = useReportingCurrencyStore((state) => state.currencyCode);
  const setCurrencyCode = useReportingCurrencyStore(
    (state) => state.setCurrencyCode,
  );
  const preferencesQuery = useQuery({
    queryKey: currencyManagementQueryKeys.preferences(),
    queryFn: getCurrencyPreferences,
  });
  const balanceQuery = useQuery({
    queryKey: accountManagementQueryKeys.mainBalance(currencyCode),
    queryFn: () => getMainAccountBalance(currencyCode),
    enabled: Boolean(currencyCode),
  });
  const totalsQuery = useQuery({
    queryKey: transactionManagementQueryKeys.dateRangeTotals({
      startDate,
      endDate,
      currencyCode,
    }),
    queryFn: () =>
      getTransactionDateRangeTotals(startDate, endDate, currencyCode),
    enabled: Boolean(startDate && endDate && currencyCode),
    placeholderData: (previousData) => previousData,
  });
  const budgetQuery = useBudgetDailyRemaining(startDate, endDate, currencyCode);

  const currencyCodes = preferencesQuery.data?.enabledCurrencyCodes ?? [];
  const currencyIndex = currencyCodes.indexOf(currencyCode);

  useEffect(() => {
    if (!preferencesQuery.data || currencyCodes.includes(currencyCode)) return;
    void setCurrencyCode(preferencesQuery.data.defaultCurrencyCode);
  }, [currencyCode, currencyCodes, preferencesQuery.data, setCurrencyCode]);

  useEffect(() => {
    if (!balanceQuery.error) return;

    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when loading main account balance",
      balanceQuery.error,
    );
  }, [balanceQuery.error]);

  useEffect(() => {
    if (!totalsQuery.error) return;

    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Error when loading transaction date range totals",
      totalsQuery.error,
    );
  }, [totalsQuery.error]);

  const remainingBudget = budgetQuery.data?.at(-1)?.remaining_amount ?? 0;

  return {
    balance: balanceQuery.data ?? 0,
    canSelectNextCurrency:
      currencyIndex >= 0 && currencyIndex < currencyCodes.length - 1,
    canSelectPreviousCurrency: currencyIndex > 0,
    currencyCode,
    expense: totalsQuery.data?.expense_total ?? 0,
    income: totalsQuery.data?.income_total ?? 0,
    isBalanceLoading: balanceQuery.isLoading,
    isBudgetLoading: budgetQuery.isLoading,
    isBudgetOver: remainingBudget < 0,
    hasBudget: Boolean(budgetQuery.data?.at(-1)?.has_budget),
    nextCurrency: () => {
      const next = currencyCodes[currencyIndex + 1];
      if (next) void setCurrencyCode(next);
    },
    previousCurrency: () => {
      const previous = currencyCodes[currencyIndex - 1];
      if (previous) void setCurrencyCode(previous);
    },
    remainingBudget,
  };
}
