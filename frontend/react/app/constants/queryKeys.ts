import type { QueryClient, QueryKey } from "@tanstack/react-query";

export enum QueryKeyModule {
  ACCOUNT_MANAGEMENT = "accountManagement",
  ACCOUNT_TYPE = "accountType",
  CATEGORY_MANAGEMENT = "categoryManagement",
  TRANSACTION_MANAGEMENT = "transactionManagement",
  BUDGET = "budget",
  ACCOUNT_SETTINGS = "accountSettings",
  CURRENCY_MANAGEMENT = "currencyManagement",
  CREDIT_CARD = "creditCard",
  TRANSACTION_SEARCH = "transactionSearch",
}

export const transactionSearchQueryKeys = {
  all: [QueryKeyModule.TRANSACTION_SEARCH] as const,
  results: () => [...transactionSearchQueryKeys.all, "result"] as const,
  result: (params: {
    keyword: string;
    filters: Record<string, string | string[] | undefined>;
    pageSize: number;
  }) => [...transactionSearchQueryKeys.results(), params] as const,
  filterOptions: () =>
    [...transactionSearchQueryKeys.all, "filterOptions"] as const,
};

export const currencyManagementQueryKeys = {
  all: [QueryKeyModule.CURRENCY_MANAGEMENT] as const,
  preferences: () =>
    [...currencyManagementQueryKeys.all, "preferences"] as const,
};

export const accountSettingsQueryKeys = {
  all: [QueryKeyModule.ACCOUNT_SETTINGS] as const,
  detail: () => [...accountSettingsQueryKeys.all, "detail"] as const,
};

export const budgetQueryKeys = {
  all: [QueryKeyModule.BUDGET] as const,
  plans: () => [...budgetQueryKeys.all, "plan"] as const,
  planList: () => [...budgetQueryKeys.plans(), "list"] as const,
  plan: (id: string) => [...budgetQueryKeys.plans(), "detail", id] as const,
  months: () => [...budgetQueryKeys.all, "month"] as const,
  month: (params: { month: string; currencyCode: string }) =>
    [...budgetQueryKeys.months(), params] as const,
  dailyRemaining: (params: {
    startDate: string;
    endDate: string;
    currencyCode: string;
  }) => [...budgetQueryKeys.months(), "dailyRemaining", params] as const,
  management: (planId?: string) =>
    [...budgetQueryKeys.all, "management", planId ?? "create"] as const,
};

export const accountTypeQueryKeys = {
  all: [QueryKeyModule.ACCOUNT_TYPE] as const,
  lists: () => [...accountTypeQueryKeys.all, "list"] as const,
  list: (params: { pageSize: number }) =>
    [...accountTypeQueryKeys.lists(), params] as const,
  details: () => [...accountTypeQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...accountTypeQueryKeys.details(), id] as const,
};

export const accountManagementQueryKeys = {
  all: [QueryKeyModule.ACCOUNT_MANAGEMENT] as const,
  lists: () => [...accountManagementQueryKeys.all, "list"] as const,
  assetBalances: () =>
    [...accountManagementQueryKeys.lists(), "assetBalance"] as const,
  assetBalance: (currencyCode?: string) =>
    currencyCode
      ? ([...accountManagementQueryKeys.assetBalances(), currencyCode] as const)
      : accountManagementQueryKeys.assetBalances(),
  list: (params: {
    pageSize: number;
    includeInactive?: boolean;
    currencyCode?: string;
  }) => [...accountManagementQueryKeys.lists(), params] as const,
  typeBalanceTotals: () =>
    [...accountManagementQueryKeys.lists(), "typeBalanceTotals"] as const,
  selectableList: (params: { pageSize: number }) =>
    [...accountManagementQueryKeys.lists(), "selectable", params] as const,
  details: () => [...accountManagementQueryKeys.all, "detail"] as const,
  detail: (id: string) =>
    [...accountManagementQueryKeys.details(), id] as const,
};

export const creditCardQueryKeys = {
  all: [QueryKeyModule.CREDIT_CARD] as const,
  cycles: () => [...creditCardQueryKeys.all, "cycle"] as const,
  currentCycle: (accountId: string) =>
    [...creditCardQueryKeys.cycles(), accountId, "current"] as const,
};

export const categoryManagementQueryKeys = {
  all: [QueryKeyModule.CATEGORY_MANAGEMENT] as const,
  lists: () => [...categoryManagementQueryKeys.all, "list"] as const,
  feeList: () => [...categoryManagementQueryKeys.lists(), "fees"] as const,
  list: (params: { typeId: number; pageSize: number }) =>
    [...categoryManagementQueryKeys.lists(), params] as const,
  periodList: (params: {
    typeId: number;
    pageSize: number;
    startDate: string;
    endDate: string;
    currencyCode?: string;
  }) => [...categoryManagementQueryKeys.lists(), "periodList", params] as const,
  details: () => [...categoryManagementQueryKeys.all, "detail"] as const,
  detail: (id: string) =>
    [...categoryManagementQueryKeys.details(), id] as const,
};

export const transactionManagementQueryKeys = {
  all: [QueryKeyModule.TRANSACTION_MANAGEMENT] as const,
  lists: () => [...transactionManagementQueryKeys.all, "list"] as const,
  frequentDescriptions: (categoryId: string, searchText = "") =>
    [
      ...transactionManagementQueryKeys.lists(),
      "frequentDescriptions",
      categoryId,
      searchText.trim().toLocaleLowerCase(),
    ] as const,
  dateRangeTotals: (params: {
    startDate: string;
    endDate: string;
    currencyCode: string;
    accountId?: string;
  }) =>
    [
      ...transactionManagementQueryKeys.lists(),
      "dateRangeTotals",
      params,
    ] as const,
  periodCurrencyCodes: (params: {
    startDate: string;
    endDate: string;
    categoryId?: string;
  }) =>
    [
      ...transactionManagementQueryKeys.lists(),
      "periodCurrencyCodes",
      params,
    ] as const,
  dailyTotals: (params: {
    startDate: string;
    endDate: string;
    currencyCode: string;
  }) =>
    [...transactionManagementQueryKeys.lists(), "dailyTotals", params] as const,
  accountForwardBalance: (params: { accountId: string; startDate: string }) =>
    [
      ...transactionManagementQueryKeys.lists(),
      "accountForwardBalance",
      params,
    ] as const,
  accountFlowTotals: (params: {
    accountId: string;
    startDate: string;
    endDate: string;
  }) =>
    [
      ...transactionManagementQueryKeys.lists(),
      "accountFlowTotals",
      params,
    ] as const,
  accountDailyBalance: (params: {
    accountId: string;
    startDate: string;
    endDate: string;
  }) =>
    [
      ...transactionManagementQueryKeys.lists(),
      "accountDailyBalance",
      params,
    ] as const,
  categoryDateRangeSummary: (params: {
    categoryId: string;
    startDate: string;
    endDate: string;
    currencyCode?: string;
  }) =>
    [
      ...transactionManagementQueryKeys.lists(),
      "categoryDateRangeSummary",
      params,
    ] as const,
  categoryDailyTotal: (params: {
    categoryId: string;
    startDate: string;
    endDate: string;
    currencyCode: string;
  }) =>
    [
      ...transactionManagementQueryKeys.lists(),
      "categoryDailyTotal",
      params,
    ] as const,
  list: (params: {
    pageSize: number;
    startDate: string;
    endDate: string;
    accountId?: string;
    categoryId?: string;
    currencyCode?: string;
    creditCardStatementDate?: string;
  }) => [...transactionManagementQueryKeys.lists(), params] as const,
  details: () => [...transactionManagementQueryKeys.all, "detail"] as const,
  detail: (id: string) =>
    [...transactionManagementQueryKeys.details(), id] as const,
  attachments: (id: string) =>
    [...transactionManagementQueryKeys.detail(id), "attachments"] as const,
};

export const invalidateQuery = (queryClient: QueryClient, queryKey: QueryKey) =>
  queryClient.invalidateQueries({ queryKey });
