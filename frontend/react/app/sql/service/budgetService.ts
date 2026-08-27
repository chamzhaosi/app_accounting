import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import {
  getBudgetByCurrencyAndMonthFromDB,
  getBudgetByPlanAndMonthFromDB,
  getBudgetCategoryProgressFromDB,
  getBudgetDailyRemainingFromDB,
  getBudgetManageCategoriesFromDB,
  getBudgetPlanCurrencyCodesFromDB,
  getBudgetPlanListFromDB,
  getMonthExpenseTotalFromDB,
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
import { getMonthKey } from "../../utils/date";
import { getCurrencyPreferences } from "./currencyManagementService";

export const getBudgetDailyRemaining = async (
  startDate: string,
  endDate: string,
): Promise<BudgetDailyRemainingType[]> => {
  const preferences = await getCurrencyPreferences();
  if (!preferences) return [];
  return getBudgetDailyRemainingFromDB(
    startDate,
    endDate,
    preferences.defaultCurrencyCode,
  );
};

export const getBudgetPlanList = async (month = getMonthKey()) =>
  getBudgetPlanListFromDB(month);

export const getAvailableBudgetCurrencyCodes = async () => {
  const [preferences, usedCurrencyCodes] = await Promise.all([
    getCurrencyPreferences(),
    getBudgetPlanCurrencyCodesFromDB(),
  ]);
  const usedCodes = new Set(usedCurrencyCodes);
  return (
    preferences?.enabledCurrencyCodes.filter((code) => !usedCodes.has(code)) ??
    []
  );
};

export const getBudgetOverview = async (
  month: string,
  currencyCode?: string,
): Promise<BudgetOverviewType | null> => {
  const preferences = await getCurrencyPreferences();
  const selectedCurrency =
    currencyCode ?? preferences?.defaultCurrencyCode ?? "MYR";
  const budget = await getBudgetByCurrencyAndMonthFromDB(
    selectedCurrency,
    month,
  );
  if (!budget) return null;

  const categories = await getBudgetCategoryProgressFromDB(
    budget.id,
    month,
    budget.currency_code,
  );
  const allocatedAmount = sumAmounts(
    categories.map((item) => item.allocated_amount),
  );
  const spentAmount = await getMonthExpenseTotalFromDB(
    month,
    budget.currency_code,
  );
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
  planId?: string,
): Promise<BudgetManagementType> => {
  const currentMonth = getMonthKey();
  const budget = planId
    ? await getBudgetByPlanAndMonthFromDB(planId, currentMonth)
    : null;
  const preferences = await getCurrencyPreferences();
  const categories = await getBudgetManageCategoriesFromDB(budget?.id);

  return {
    planId: budget?.plan_id ?? null,
    currencyCode: budget?.currency_code ?? null,
    isCurrencyEnabled: budget
      ? (preferences?.enabledCurrencyCodes.includes(budget.currency_code) ??
        false)
      : true,
    budget,
    categories,
  };
};

export const saveBudget = async (
  data: BudgetSaveReqType,
): Promise<string | void> => {
  if (data.effectiveMonth !== getMonthKey())
    return "Budgets can only be changed for the current month.";

  if (
    !isValidAmount(data.totalBudget) ||
    compareAmounts(data.totalBudget, 0) <= 0
  )
    return "Total budget must be greater than zero.";

  const preferences = await getCurrencyPreferences();
  if (!preferences?.enabledCurrencyCodes.includes(data.currencyCode))
    return "Enable this currency before managing its budget.";

  if (data.planId) {
    const existingBudget = await getBudgetByPlanAndMonthFromDB(
      data.planId,
      data.effectiveMonth,
    );
    if (!existingBudget) return "Budget not found.";
    if (existingBudget.currency_code !== data.currencyCode)
      return "Budget currency cannot be changed.";
  } else {
    const usedCurrencyCodes = await getBudgetPlanCurrencyCodesFromDB();
    if (usedCurrencyCodes.includes(data.currencyCode))
      return "A budget already exists for this currency.";
  }

  if (data.allocations.some((item) => !isValidAmount(item.amount)))
    return "Enter allocations with up to 13 integer digits and 2 decimal places.";

  if (data.allocations.some((item) => compareAmounts(item.amount, 0) === 0))
    return "Enter an amount greater than zero for every selected category.";

  const positiveAllocations = data.allocations.filter(
    (item) => compareAmounts(item.amount, 0) > 0,
  );
  const allocatedAmount = sumAmounts(
    positiveAllocations.map((item) => item.amount),
  );
  if (compareAmounts(allocatedAmount, data.totalBudget) > 0)
    return "Category allocations cannot exceed the total budget.";

  const categoryIds = positiveAllocations.map((item) => item.categoryId);
  if (new Set(categoryIds).size !== categoryIds.length)
    return "The same category cannot be allocated twice.";

  const existingBudget = data.planId
    ? await getBudgetByPlanAndMonthFromDB(data.planId, data.effectiveMonth)
    : null;
  const availableCategories = await getBudgetManageCategoriesFromDB(
    existingBudget?.id,
  );
  const availableIds = new Set(
    availableCategories.map((item) => item.category_id),
  );
  if (categoryIds.some((id) => !availableIds.has(id)))
    return "One or more expense categories are no longer available.";

  debugLog(DEBUG_TAG.BUDGET, "Saving recurring budget", {
    planId: data.planId,
    currencyCode: data.currencyCode,
    allocationCount: positiveAllocations.length,
  });
  await saveBudgetToDB({ ...data, allocations: positiveAllocations });
};
