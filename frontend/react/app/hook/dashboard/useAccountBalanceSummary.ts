import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  accountManagementQueryKeys,
  currencyManagementQueryKeys,
  transactionManagementQueryKeys,
} from "../../constants/queryKeys";
import { getAssetBalance } from "../../sql/service/accMgmtService";
import { getTransactionDateRangeTotals } from "../../sql/service/transactionMgmtService";
import { DEBUG_TAG } from "../../utils/debugLog";
import useBudgetDailyRemaining from "./useBudgetDailyRemaining";
import { useReportingCurrencyStore } from "../../stores/useReportingCurrencyStore";
import { getCurrencyPreferences } from "../../sql/service/currencyManagementService";
import usePeriodCurrencyCodes from "../transaction_management/usePeriodCurrencyCodes";
import { ALL_CURRENCIES_VALUE } from "../../constants/currencies";

export default function useAccountBalanceSummary(
  startDate: string,
  endDate: string,
) {
  const storedCurrencyCode = useReportingCurrencyStore(
    (state) => state.currencyCode,
  );
  const currencySelection = useReportingCurrencyStore(
    (state) => state.currencySelection,
  );
  const setCurrencyCode = useReportingCurrencyStore(
    (state) => state.setCurrencyCode,
  );
  const setCurrencySelection = useReportingCurrencyStore(
    (state) => state.setCurrencySelection,
  );
  const preferencesQuery = useQuery({
    queryKey: currencyManagementQueryKeys.preferences(),
    queryFn: getCurrencyPreferences,
  });
  const currencyCode =
    currencySelection === ALL_CURRENCIES_VALUE
      ? (preferencesQuery.data?.defaultCurrencyCode ?? storedCurrencyCode)
      : currencySelection;
  const balanceQuery = useQuery({
    queryKey: accountManagementQueryKeys.assetBalance(currencyCode),
    queryFn: () => getAssetBalance(currencyCode),
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

  const { currencyCodes, isFetched: arePeriodCurrenciesFetched } =
    usePeriodCurrencyCodes(startDate, endDate, {
      pendingCurrencyCode: currencyCode,
    });
  const currencyIndex = currencyCodes.indexOf(currencyCode);

  useEffect(() => {
    const defaultCurrencyCode = preferencesQuery.data?.defaultCurrencyCode;
    if (
      currencySelection !== ALL_CURRENCIES_VALUE ||
      !defaultCurrencyCode ||
      storedCurrencyCode === defaultCurrencyCode
    )
      return;
    void setCurrencyCode(defaultCurrencyCode);
  }, [
    currencySelection,
    preferencesQuery.data?.defaultCurrencyCode,
    setCurrencyCode,
    storedCurrencyCode,
  ]);

  useEffect(() => {
    if (
      !preferencesQuery.data ||
      !arePeriodCurrenciesFetched ||
      currencyCodes.includes(currencyCode)
    )
      return;
    if (currencySelection === ALL_CURRENCIES_VALUE) {
      void setCurrencyCode(preferencesQuery.data.defaultCurrencyCode);
      return;
    }
    void setCurrencySelection(preferencesQuery.data.defaultCurrencyCode);
  }, [
    arePeriodCurrenciesFetched,
    currencyCode,
    currencyCodes,
    currencySelection,
    preferencesQuery.data,
    setCurrencyCode,
    setCurrencySelection,
  ]);

  useEffect(() => {
    if (!balanceQuery.error) return;

    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when loading asset balance",
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
      if (next) void setCurrencySelection(next);
    },
    previousCurrency: () => {
      const previous = currencyCodes[currencyIndex - 1];
      if (previous) void setCurrencySelection(previous);
    },
    remainingBudget,
  };
}
