import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { AppState } from "react-native";
import type { AppDateRangeValue } from "../../components/AppDateRangePicker";
import {
  accountManagementQueryKeys,
  transactionManagementQueryKeys,
  creditCardQueryKeys,
  invalidateQuery,
} from "../../constants/queryKeys";
import { getAccMgmtById } from "../../sql/service/accMgmtService";
import {
  getAccountDateRangeFlowTotals,
  getAccountForwardBalance,
} from "../../sql/service/transactionMgmtService";
import { addAmounts, subtractAmounts } from "../../utils/amount";
import { formatDateValue, getCurrentMonthDateRange } from "../../utils/date";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import {
  getCurrentCreditCardCycle,
  setCreditCardCycleSkipped,
} from "../../sql/service/creditCardService";
import { getCreditCardNotificationPermission } from "../../local/creditCardNotifications";

export default function useAccountDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<AppDateRangeValue>(
    getCurrentMonthDateRange,
  );
  const [notificationsAvailable, setNotificationsAvailable] = useState(true);
  const startDate = formatDateValue(dateRange.startDate);
  const endDate = formatDateValue(dateRange.endDate);

  const accountQuery = useQuery({
    queryKey: accountManagementQueryKeys.detail(id),
    queryFn: () => getAccMgmtById(id),
    enabled: Boolean(id),
  });
  const isCreditCard = accountQuery.data?.type_label === "Credit Card";
  const remindersEnabled = Boolean(
    isCreditCard && accountQuery.data?.credit_card_reminder_enabled,
  );
  useEffect(() => {
    if (!remindersEnabled) {
      setNotificationsAvailable(true);
      return;
    }

    let isMounted = true;
    const refreshNotificationPermission = async () => {
      try {
        const permission = await getCreditCardNotificationPermission(true);
        debugLog(
          DEBUG_TAG.CREDIT_CARD,
          "Notification permission status",
          permission,
        );
        if (isMounted) setNotificationsAvailable(permission.granted);
      } catch (error) {
        console.error(
          DEBUG_TAG.CREDIT_CARD,
          "Error when checking notification permission",
          error,
        );
      }
    };

    void refreshNotificationPermission();
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") void refreshNotificationPermission();
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [remindersEnabled]);
  const cycleQuery = useQuery({
    queryKey: creditCardQueryKeys.currentCycle(id),
    queryFn: () => getCurrentCreditCardCycle(id),
    enabled: Boolean(
      id && isCreditCard && accountQuery.data?.credit_card_reminder_enabled,
    ),
  });
  const toggleCycleSkipped = async () => {
    const cycle = cycleQuery.data;
    if (!cycle) return;
    await setCreditCardCycleSkipped(id, cycle.id, !cycle.is_skipped);
    await invalidateQuery(queryClient, creditCardQueryKeys.currentCycle(id));
  };
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
    creditCardCycle: cycleQuery.data,
    isCreditCard,
    dateRange,
    endDate,
    forwardBalance,
    id,
    isForwardBalanceLoading: forwardBalanceQuery.isLoading,
    isLoading: accountQuery.isLoading,
    moneyIn,
    moneyOut,
    notificationsAvailable,
    periodEndBalance,
    setDateRange,
    toggleCycleSkipped,
    startDate,
  };
}
