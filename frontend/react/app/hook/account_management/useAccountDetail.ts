import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import type { AppDateRangeValue } from "../../components/AppDateRangePicker";
import {
  accountManagementQueryKeys,
  transactionManagementQueryKeys,
} from "../../constants/queryKeys";
import { getAccMgmtById } from "../../sql/service/accMgmtService";
import {
  getAccountDateRangeFlowTotals,
  getAccountForwardBalance,
} from "../../sql/service/transactionMgmtService";
import { addAmounts, subtractAmounts } from "../../utils/amount";
import { formatDateValue, getCurrentMonthDateRange } from "../../utils/date";
import { DEBUG_TAG } from "../../utils/debugLog";

export default function useAccountDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dateRange, setDateRange] = useState<AppDateRangeValue>(
    getCurrentMonthDateRange,
  );
  const startDate = formatDateValue(dateRange.startDate);
  const endDate = formatDateValue(dateRange.endDate);

  const accountQuery = useQuery({
    queryKey: accountManagementQueryKeys.detail(id),
    queryFn: () => getAccMgmtById(id),
    enabled: Boolean(id),
  });
  const flowTotalsQuery = useQuery({
    queryKey: transactionManagementQueryKeys.accountFlowTotals({
      accountId: id,
      startDate,
      endDate,
    }),
    queryFn: () => getAccountDateRangeFlowTotals(id, startDate, endDate),
    enabled: Boolean(id && startDate && endDate),
    placeholderData: (previousData) => previousData,
  });
  const forwardBalanceQuery = useQuery({
    queryKey: transactionManagementQueryKeys.accountForwardBalance({
      accountId: id,
      startDate,
    }),
    queryFn: () => getAccountForwardBalance(id, startDate),
    enabled: Boolean(id && startDate),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (!accountQuery.error) return;
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when loading account detail page",
      accountQuery.error,
    );
  }, [accountQuery.error]);

  useEffect(() => {
    if (!flowTotalsQuery.error) return;
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Error when loading account flow totals",
      flowTotalsQuery.error,
    );
  }, [flowTotalsQuery.error]);

  useEffect(() => {
    if (!forwardBalanceQuery.error) return;
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Error when loading account forward balance",
      forwardBalanceQuery.error,
    );
  }, [forwardBalanceQuery.error]);

  const moneyIn = flowTotalsQuery.data?.in_total ?? 0;
  const moneyOut = flowTotalsQuery.data?.out_total ?? 0;
  const forwardBalance = forwardBalanceQuery.data ?? 0;
  const periodEndBalance = addAmounts(
    subtractAmounts(forwardBalance, moneyOut),
    moneyIn,
  );

  return {
    account: accountQuery.data,
    dateRange,
    endDate,
    forwardBalance,
    id,
    isForwardBalanceLoading: forwardBalanceQuery.isLoading,
    isLoading: accountQuery.isLoading,
    moneyIn,
    moneyOut,
    periodEndBalance,
    setDateRange,
    startDate,
  };
}
