import { useQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  budgetQueryKeys,
  currencyManagementQueryKeys,
} from "../../constants/queryKeys";
import {
  BUDGET_MANAGEMENT_BASE_URL,
  CURRENCY_MANAGEMENT_URL,
} from "../../constants/urls";
import {
  getAvailableBudgetCurrencyCodes,
  getBudgetPlanList,
} from "../../sql/service/budgetService";
import { getCurrencyPreferences } from "../../sql/service/currencyManagementService";
import type { BudgetPlanListItemType } from "../../sql/types/budgetType";
import { DEBUG_TAG } from "../../utils/debugLog";

export default function useBudgetPlanList() {
  const [lockedCurrencyCode, setLockedCurrencyCode] = useState<string>();
  const plansQuery = useQuery({
    queryKey: budgetQueryKeys.planList(),
    queryFn: () => getBudgetPlanList(),
  });
  const availableCurrenciesQuery = useQuery({
    queryKey: [...budgetQueryKeys.planList(), "availableCurrencies"],
    queryFn: getAvailableBudgetCurrencyCodes,
  });
  const preferencesQuery = useQuery({
    queryKey: currencyManagementQueryKeys.preferences(),
    queryFn: getCurrencyPreferences,
  });

  useEffect(() => {
    if (!plansQuery.error) return;
    console.error(
      DEBUG_TAG.BUDGET,
      "Error when loading recurring budget plans",
      plansQuery.error,
    );
  }, [plansQuery.error]);

  const plans = useMemo(() => {
    const defaultCode = preferencesQuery.data?.defaultCurrencyCode;
    return [...(plansQuery.data ?? [])].sort(
      (left, right) =>
        Number(right.currency_code === defaultCode) -
          Number(left.currency_code === defaultCode) ||
        Number(right.is_currency_enabled) - Number(left.is_currency_enabled) ||
        Number(right.is_active) - Number(left.is_active) ||
        left.currency_code.localeCompare(right.currency_code),
    );
  }, [plansQuery.data, preferencesQuery.data?.defaultCurrencyCode]);

  const onPressPlan = (plan: BudgetPlanListItemType) => {
    if (!plan.is_currency_enabled) {
      setLockedCurrencyCode(plan.currency_code);
      return;
    }
    router.push(`${BUDGET_MANAGEMENT_BASE_URL}/${plan.plan_id}` as Href);
  };

  return {
    canCreate: Boolean(availableCurrenciesQuery.data?.length),
    dismissLockedDialog: () => setLockedCurrencyCode(undefined),
    isLoading:
      plansQuery.isLoading ||
      availableCurrenciesQuery.isLoading ||
      preferencesQuery.isLoading,
    isRefetching: plansQuery.isRefetching,
    lockedCurrencyCode,
    onOpenCurrencyManagement: () => {
      setLockedCurrencyCode(undefined);
      router.push(CURRENCY_MANAGEMENT_URL as Href);
    },
    onPressPlan,
    onRefresh: plansQuery.refetch,
    plans,
  };
}
