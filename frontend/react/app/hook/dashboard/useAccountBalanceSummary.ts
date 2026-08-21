import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  accountManagementQueryKeys,
  transactionManagementQueryKeys,
} from "../../constants/queryKeys";
import { getMainAccountBalance } from "../../sql/service/accMgmtService";
import { getTransactionDateRangeTotals } from "../../sql/service/transactionMgmtService";
import { DEBUG_TAG } from "../../utils/debugLog";
import useBudgetDailyRemaining from "./useBudgetDailyRemaining";

export default function useAccountBalanceSummary(
  startDate: string,
  endDate: string,
) {
  const balanceQuery = useQuery({
    queryKey: accountManagementQueryKeys.mainBalance(),
    queryFn: getMainAccountBalance,
  });
  const totalsQuery = useQuery({
    queryKey: transactionManagementQueryKeys.dateRangeTotals({
      startDate,
      endDate,
    }),
    queryFn: () => getTransactionDateRangeTotals(startDate, endDate),
    enabled: Boolean(startDate && endDate),
    placeholderData: (previousData) => previousData,
  });
  const budgetQuery = useBudgetDailyRemaining(startDate, endDate);

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
    expense: totalsQuery.data?.expense_total ?? 0,
    income: totalsQuery.data?.income_total ?? 0,
    isBalanceLoading: balanceQuery.isLoading,
    isBudgetLoading: budgetQuery.isLoading,
    isBudgetOver: remainingBudget < 0,
    remainingBudget,
  };
}
