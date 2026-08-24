import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { budgetQueryKeys } from "../../constants/queryKeys";
import { getBudgetOverview } from "../../sql/service/budgetService";
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

type BudgetProgressTheme = {
  primary: string;
  warning: string;
  error: string;
  outline: string;
};

export default function useBudgetOverview(theme: BudgetProgressTheme) {
  const [month, setMonth] = useState(getMonthKey);
  const query = useQuery({
    queryKey: budgetQueryKeys.month(month),
    queryFn: () => getBudgetOverview(month),
  });

  useEffect(() => {
    if (!query.error) return;
    console.error(DEBUG_TAG.BUDGET, "Error when loading budget", query.error);
  }, [query.error]);

  const overview = query.data;
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

  return {
    categories,
    isCurrentMonth: month === getMonthKey(),
    isError: query.isError,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    month,
    onRefresh: query.refetch,
    onRetry: () => void query.refetch(),
    overallColor: getBudgetProgressColor(overallRatio, theme),
    overallProgress: Math.min(overallRatio, 1),
    overview,
    setMonth,
  };
}
