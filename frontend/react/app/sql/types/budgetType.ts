export type BudgetRspType = {
  id: string;
  plan_id: string;
  currency_code: string;
  month: string;
  total_budget: number;
  is_active: boolean;
};

export type BudgetPlanListItemType = {
  plan_id: string;
  currency_code: string;
  revision_id: string;
  effective_month: string;
  total_budget: number;
  is_active: boolean;
  is_currency_enabled: boolean;
  allocation_count: number;
  allocated_amount: number;
};

export type BudgetCategoryProgressType = {
  allocation_id: string;
  category_id: string;
  label: string;
  translation_key: string | null;
  icon: string;
  allocated_amount: number;
  spent_amount: number;
};

export type BudgetOverviewType = {
  budget: BudgetRspType;
  categories: BudgetCategoryProgressType[];
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  unallocatedAmount: number;
  overallocatedAmount: number;
};

export type BudgetDailyRemainingType = {
  transaction_date: string;
  total_budget: number;
  remaining_amount: number;
  has_budget: boolean;
};

export type BudgetManageCategoryType = {
  category_id: string;
  label: string;
  translation_key: string | null;
  icon: string;
  allocation_id: string | null;
  amount: number;
};

export type BudgetManagementType = {
  planId: string | null;
  currencyCode: string | null;
  isCurrencyEnabled: boolean;
  budget: BudgetRspType | null;
  categories: BudgetManageCategoryType[];
};

export type BudgetSaveReqType = {
  planId?: string;
  currencyCode: string;
  effectiveMonth: string;
  totalBudget: string;
  isActive: boolean;
  allocations: Array<{ categoryId: string; amount: string }>;
};
