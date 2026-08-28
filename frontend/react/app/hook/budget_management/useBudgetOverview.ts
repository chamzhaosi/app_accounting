import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  budgetQueryKeys,
  currencyManagementQueryKeys,
} from "../../constants/queryKeys";
import {
  getBudgetOverview,
  getBudgetPlanList,
} from "../../sql/service/budgetService";
import { getCurrencyPreferences } from "../../sql/service/currencyManagementService";
import {
  compareAmounts,
  getAmountRatio,
  subtractAmounts,
} from "../../utils/amount";
import { getMonthKey } from "../../utils/date";
import { DEBUG_TAG } from "../../utils/debugLog";
import {
  BUDGET_PIE_COLORS,
  getBudgetProgressColor,
  getCategoryProgressLabel,
  getCategoryProgressRatio,
  sortCategoriesByProgress,
  sortCategoriesBySpent,
} from "./budgetOverview.utils";
import { useReportingCurrencyStore } from "../../stores/useReportingCurrencyStore";

type BudgetProgressTheme = {
  primary: string;
  warning: string;
  error: string;
  outline: string;
};

export default function useBudgetOverview(theme: BudgetProgressTheme) {
  const currentMonth = getMonthKey();
  const [month, setMonthState] = useState(currentMonth);
  const selectedCurrencyCode = useReportingCurrencyStore(
    (state) => state.currencyCode,
  );
  const setSelectedCurrencyCode = useReportingCurrencyStore(
    (state) => state.setCurrencyCode,
  );
  const plansQuery = useQuery({
    queryKey: budgetQueryKeys.planList(),
    queryFn: () => getBudgetPlanList(currentMonth),
  });
  const preferencesQuery = useQuery({
    queryKey: currencyManagementQueryKeys.preferences(),
    queryFn: getCurrencyPreferences,
  });
  const plans = useMemo(() => {
    const defaultCode = preferencesQuery.data?.defaultCurrencyCode;
    return [...(plansQuery.data ?? [])].sort(
      (left, right) =>
        Number(right.currency_code === defaultCode) -
          Number(left.currency_code === defaultCode) ||
        left.currency_code.localeCompare(right.currency_code),
    );
  }, [plansQuery.data, preferencesQuery.data?.defaultCurrencyCode]);

  const currencyCodes = useMemo(() => {
    const enabled = preferencesQuery.data?.enabledCurrencyCodes ?? [];
    const codes = new Set(enabled);
    plans.forEach((plan) => codes.add(plan.currency_code));
    const defaultCode = preferencesQuery.data?.defaultCurrencyCode;
    return Array.from(codes).sort(
      (left, right) =>
        Number(right === defaultCode) - Number(left === defaultCode) ||
        left.localeCompare(right),
    );
  }, [plans, preferencesQuery.data]);

  useEffect(() => {
    if (!preferencesQuery.data || currencyCodes.includes(selectedCurrencyCode))
      return;
    void setSelectedCurrencyCode(
      preferencesQuery.data.defaultCurrencyCode ?? currencyCodes[0],
    );
  }, [
    currencyCodes,
    preferencesQuery.data,
    selectedCurrencyCode,
    setSelectedCurrencyCode,
  ]);

  const query = useQuery({
    queryKey: budgetQueryKeys.month({
      month,
      currencyCode: selectedCurrencyCode,
    }),
    queryFn: () => getBudgetOverview(month, selectedCurrencyCode),
    enabled: Boolean(selectedCurrencyCode),
  });

  useEffect(() => {
    const error = query.error ?? plansQuery.error ?? preferencesQuery.error;
    if (error)
      console.error(DEBUG_TAG.BUDGET, "Error when loading budget", error);
  }, [plansQuery.error, preferencesQuery.error, query.error]);

  const overview = query.data;
  const selectedPlan =
    plans.find((plan) => plan.currency_code === selectedCurrencyCode) ?? null;
  const selectedCurrencyIndex = currencyCodes.indexOf(selectedCurrencyCode);
  const overallRatio = overview
    ? getAmountRatio(overview.spentAmount, overview.budget.total_budget)
    : 0;
  const expenseColorByCategoryId = useMemo(
    () =>
      new Map(
        (overview
          ? [...overview.categories]
              .filter(
                (category) => compareAmounts(category.spent_amount, 0) > 0,
              )
              .sort(sortCategoriesBySpent)
          : []
        ).map((category, index, categories) => [
          category.category_id,
          BUDGET_PIE_COLORS[
            (categories.length > 6 && index >= 5 ? 5 : index) %
              BUDGET_PIE_COLORS.length
          ],
        ]),
      ),
    [overview],
  );
  const categories = useMemo(
    () =>
      overview
        ? [...overview.categories]
            .sort(sortCategoriesByProgress)
            .map((category) => ({
              ...category,
              color:
                expenseColorByCategoryId.get(category.category_id) ??
                theme.outline,
              progressLabel: getCategoryProgressLabel(category),
              progressRatio: getCategoryProgressRatio(category),
              remainingAmount: subtractAmounts(
                category.allocated_amount,
                category.spent_amount,
              ),
            }))
        : [],
    [expenseColorByCategoryId, overview, theme.outline],
  );
  const selectCurrencyOffset = (offset: number) => {
    const index = currencyCodes.indexOf(selectedCurrencyCode);
    const next = index >= 0 ? currencyCodes[index + offset] : undefined;
    if (next) void setSelectedCurrencyCode(next);
  };

  return {
    categories,
    canSelectNextCurrency:
      selectedCurrencyIndex >= 0 &&
      selectedCurrencyIndex < currencyCodes.length - 1,
    canSelectPreviousCurrency: selectedCurrencyIndex > 0,
    currencyCount: currencyCodes.length,
    isCurrentMonth: month === currentMonth,
    isError: query.isError || plansQuery.isError || preferencesQuery.isError,
    isLoading:
      plansQuery.isLoading ||
      preferencesQuery.isLoading ||
      (currencyCodes.length > 0 && !selectedCurrencyCode) ||
      (Boolean(selectedCurrencyCode) && query.isLoading),
    isRefetching: query.isRefetching || plansQuery.isRefetching,
    month,
    nextCurrency: () => selectCurrencyOffset(1),
    onRefresh: async () => {
      await Promise.all([plansQuery.refetch(), query.refetch()]);
    },
    onRetry: () => void Promise.all([plansQuery.refetch(), query.refetch()]),
    overallColor: getBudgetProgressColor(overallRatio, theme),
    overallProgressLabel: `${(overallRatio * 100).toFixed(
      overallRatio >= 10 ? 0 : 1,
    )}%`,
    overallProgress: Math.min(overallRatio, 1),
    overview,
    previousCurrency: () => selectCurrencyOffset(-1),
    selectedCurrencyCode,
    selectedCurrencyEnabled:
      preferencesQuery.data?.enabledCurrencyCodes.includes(
        selectedCurrencyCode,
      ) ?? false,
    selectedPlanId: selectedPlan?.plan_id ?? null,
    setMonth: (nextMonth: string) => {
      if (nextMonth <= currentMonth) setMonthState(nextMonth);
    },
  };
}
