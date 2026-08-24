import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import {
  getBudgetByMonthFromDB,
  getBudgetCategoryProgressFromDB,
  getBudgetDailyRemainingFromDB,
  getBudgetManageCategoriesFromDB,
  getMonthExpenseTotalFromDB,
  rolloverBudgetFromLatestToDB,
  saveBudgetToDB,
} from "../repo/budgetRepo";
import type {
  BudgetDailyRemainingType,
  BudgetManagementType,
  BudgetOverviewType,
  BudgetSaveReqType,
} from "../types/budgetType";
import {
  absoluteAmount,
  compareAmounts,
  isValidAmount,
  subtractAmounts,
  sumAmounts,
} from "../../utils/amount";
import { getMonthEndKey, getMonthKey } from "../../utils/date";

const getBudgetWithCurrentMonthRollover = async (month: string) => {
  let budget = await getBudgetByMonthFromDB(month);
  if (!budget && month === getMonthKey()) {
    await rolloverBudgetFromLatestToDB(month);
    budget = await getBudgetByMonthFromDB(month);
  }
  return budget;
};

export const getBudgetDailyRemaining = async (
  startDate: string,
  endDate: string,
): Promise<BudgetDailyRemainingType[]> => {
  const currentMonth = getMonthKey();
  if (startDate <= getMonthEndKey(currentMonth) && endDate >= currentMonth) {
    await getBudgetWithCurrentMonthRollover(currentMonth);
  }
  return getBudgetDailyRemainingFromDB(startDate, endDate);
};

export const getBudgetOverview = async (
  month: string,
): Promise<BudgetOverviewType | null> => {
  const budget = await getBudgetWithCurrentMonthRollover(month);
  if (!budget) return null;

  const categories = await getBudgetCategoryProgressFromDB(budget.id, month);
  const allocatedAmount = sumAmounts(
    categories.map((item) => item.allocated_amount),
  );
  const spentAmount = await getMonthExpenseTotalFromDB(month);
  const remainingAmount = subtractAmounts(budget.total_budget, spentAmount);
  const allocationDifference = subtractAmounts(
    budget.total_budget,
    allocatedAmount,
  );

  return {
    budget,
    categories,
    allocatedAmount,
    spentAmount,
    remainingAmount,
    unallocatedAmount:
      compareAmounts(allocationDifference, 0) > 0 ? allocationDifference : 0,
    overallocatedAmount:
      compareAmounts(allocationDifference, 0) < 0
        ? absoluteAmount(allocationDifference)
        : 0,
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
  if (
    !isValidAmount(data.totalBudget) ||
    compareAmounts(data.totalBudget, 0) <= 0
  )
    return "Total budget must be greater than zero.";

  if (data.allocations.some((item) => !isValidAmount(item.amount)))
    return "Enter allocations with up to 13 integer digits and 2 decimal places.";

  if (data.allocations.some((item) => compareAmounts(item.amount, 0) === 0))
    return "Enter an amount greater than zero for every selected category.";

  const positiveAllocations = data.allocations.filter(
    (item) => compareAmounts(item.amount, 0) > 0,
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
