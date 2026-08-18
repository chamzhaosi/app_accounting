import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import {
  getBudgetByMonthFromDB,
  getBudgetCategoryProgressFromDB,
  getBudgetManageCategoriesFromDB,
  getMonthExpenseTotalFromDB,
  rolloverBudgetFromLatestToDB,
  saveBudgetToDB,
} from "../repo/budgetRepo";
import type {
  BudgetManagementType,
  BudgetOverviewType,
  BudgetSaveReqType,
} from "../types/budgetType";
import { getMonthKey } from "../../utils/date";

const getBudgetWithCurrentMonthRollover = async (month: string) => {
  let budget = await getBudgetByMonthFromDB(month);
  if (!budget && month === getMonthKey()) {
    await rolloverBudgetFromLatestToDB(month);
    budget = await getBudgetByMonthFromDB(month);
  }
  return budget;
};

export const getBudgetOverview = async (
  month: string,
): Promise<BudgetOverviewType | null> => {
  const budget = await getBudgetWithCurrentMonthRollover(month);
  if (!budget) return null;

  const categories = await getBudgetCategoryProgressFromDB(budget.id, month);
  const allocatedAmount = categories.reduce(
    (total, item) => total + item.allocated_amount,
    0,
  );
  const spentAmount = await getMonthExpenseTotalFromDB(month);

  return {
    budget,
    categories,
    allocatedAmount,
    spentAmount,
    remainingAmount: budget.total_budget - spentAmount,
    unallocatedAmount: Math.max(budget.total_budget - allocatedAmount, 0),
    overallocatedAmount: Math.max(allocatedAmount - budget.total_budget, 0),
  };
};

export const getBudgetManagement = async (
  month: string,
): Promise<BudgetManagementType> => {
  const budget = await getBudgetWithCurrentMonthRollover(month);
  const categories = await getBudgetManageCategoriesFromDB(budget?.id);
  return { budget, categories };
};

export const saveBudget = async (
  data: BudgetSaveReqType,
): Promise<string | void> => {
  if (!Number.isFinite(data.totalBudget) || data.totalBudget <= 0)
    return "Total budget must be greater than zero.";

  if (
    data.allocations.some(
      (item) => !Number.isFinite(item.amount) || item.amount < 0,
    )
  )
    return "Category allocations cannot be negative.";

  if (data.allocations.some((item) => item.amount === 0))
    return "Enter an amount greater than zero for every selected category.";

  const positiveAllocations = data.allocations.filter(
    (item) => item.amount > 0,
  );

  const categoryIds = positiveAllocations.map((item) => item.categoryId);
  if (new Set(categoryIds).size !== categoryIds.length)
    return "The same category cannot be allocated twice.";

  const availableCategories = await getBudgetManageCategoriesFromDB(
    (await getBudgetByMonthFromDB(data.month))?.id,
  );
  const availableIds = new Set(
    availableCategories.map((item) => item.category_id),
  );
  if (categoryIds.some((id) => !availableIds.has(id)))
    return "One or more expense categories are no longer available.";

  debugLog(DEBUG_TAG.BUDGET, "Saving budget", {
    month: data.month,
    allocationCount: positiveAllocations.length,
  });
  await saveBudgetToDB({ ...data, allocations: positiveAllocations });
};
