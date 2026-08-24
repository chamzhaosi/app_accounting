export type BudgetRspType = {
  id: string;
  month: string;
  total_budget: number;
  is_active: boolean;
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
  budget: BudgetRspType | null;
  categories: BudgetManageCategoryType[];
};

export type BudgetSaveReqType = {
  month: string;
  totalBudget: string;
  isActive: boolean;
  allocations: Array<{ categoryId: string; amount: string }>;
};
