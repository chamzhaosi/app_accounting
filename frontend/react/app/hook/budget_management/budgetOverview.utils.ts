import type { BudgetOverviewType } from "../../sql/types/budgetType";
import {
  compareAmounts,
  getAmountPercentage,
  getAmountRatio,
} from "../../utils/amount";

export const BUDGET_PIE_COLORS = [
  "#006878",
  "#C62828",
  "#D99A00",
  "#6A5ACD",
  "#16803D",
  "#D05A9B",
  "#3F7CAC",
  "#A05A2C",
];

export type BudgetOverviewCategory = BudgetOverviewType["categories"][number];

export const sortCategoriesBySpent = (
  first: BudgetOverviewCategory,
  second: BudgetOverviewCategory,
) =>
  compareAmounts(second.spent_amount, first.spent_amount) ||
  first.label.localeCompare(second.label);

export const getCategoryProgressRatio = (category: BudgetOverviewCategory) => {
  if (compareAmounts(category.allocated_amount, 0) > 0) {
    return getAmountRatio(category.spent_amount, category.allocated_amount);
  }

  return compareAmounts(category.spent_amount, 0) > 0
    ? Number.POSITIVE_INFINITY
    : 0;
};

export const sortCategoriesByProgress = (
  first: BudgetOverviewCategory,
  second: BudgetOverviewCategory,
) => {
  const firstRatio = getCategoryProgressRatio(first);
  const secondRatio = getCategoryProgressRatio(second);

  return firstRatio === secondRatio
    ? sortCategoriesBySpent(first, second)
    : secondRatio - firstRatio;
};

export const getCategoryProgressLabel = (category: BudgetOverviewCategory) => {
  if (compareAmounts(category.allocated_amount, 0) <= 0) {
    return compareAmounts(category.spent_amount, 0) > 0 ? "Unbudgeted" : "0.0%";
  }

  return `${getAmountPercentage(
    category.spent_amount,
    category.allocated_amount,
  ).toFixed(1)}%`;
};

export const getBudgetProgressColor = (
  ratio: number,
  theme: { primary: string; warning: string; error: string },
) => {
  if (ratio >= 1) return theme.error;
  if (ratio >= 0.8) return theme.warning;
  return theme.primary;
};
