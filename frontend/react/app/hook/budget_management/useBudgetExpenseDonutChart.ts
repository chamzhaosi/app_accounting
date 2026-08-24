import { useMemo, useState } from "react";
import type { BudgetOverviewType } from "../../sql/types/budgetType";
import {
  compareAmounts,
  getAmountPercentage,
  sumAmounts,
} from "../../utils/amount";
import {
  BUDGET_PIE_COLORS,
  sortCategoriesBySpent,
} from "./budgetOverview.utils";

export default function useBudgetExpenseDonutChart(
  overview: BudgetOverviewType,
) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const chartCategories = useMemo(() => {
    const categories = [...overview.categories]
      .filter((category) => compareAmounts(category.spent_amount, 0) > 0)
      .sort(sortCategoriesBySpent);

    return categories.length <= 6
      ? categories
      : [
          ...categories.slice(0, 5),
          {
            label: "Other",
            spent_amount: sumAmounts(
              categories.slice(5).map((category) => category.spent_amount),
            ),
          },
        ];
  }, [overview.categories]);
  const activeIndex = Math.min(
    selectedIndex,
    Math.max(chartCategories.length - 1, 0),
  );
  const selectedCategory = chartCategories[activeIndex];
  const selectedPercentage =
    selectedCategory && compareAmounts(overview.spentAmount, 0) !== 0
      ? getAmountPercentage(selectedCategory.spent_amount, overview.spentAmount)
      : 0;
  const pieData = chartCategories.map((category, index) => ({
    value: category.spent_amount,
    color: BUDGET_PIE_COLORS[index % BUDGET_PIE_COLORS.length],
  }));

  return {
    activeIndex,
    chartCategories,
    pieData,
    selectedCategory,
    selectedPercentage,
    setSelectedIndex,
  };
}
