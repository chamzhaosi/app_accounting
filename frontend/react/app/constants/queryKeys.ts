import type { QueryClient, QueryKey } from "@tanstack/react-query";

export enum QueryKeyModule {
  ACCOUNT_MANAGEMENT = "accountManagement",
  ACCOUNT_TYPE = "accountType",
  CATEGORY_MANAGEMENT = "categoryManagement",
  TRANSACTION_MANAGEMENT = "transactionManagement",
  BUDGET = "budget",
}

export const budgetQueryKeys = {
  all: [QueryKeyModule.BUDGET] as const,
  months: () => [...budgetQueryKeys.all, "month"] as const,
  month: (month: string) => [...budgetQueryKeys.months(), month] as const,
  management: (month: string) =>
    [...budgetQueryKeys.all, "management", month] as const,
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
  mainBalance: () =>
    [...accountManagementQueryKeys.lists(), "mainBalance"] as const,
  list: (params: { pageSize: number }) =>
    [...accountManagementQueryKeys.lists(), params] as const,
  details: () => [...accountManagementQueryKeys.all, "detail"] as const,
  detail: (id: string) =>
    [...accountManagementQueryKeys.details(), id] as const,
};

export const categoryManagementQueryKeys = {
  all: [QueryKeyModule.CATEGORY_MANAGEMENT] as const,
  lists: () => [...categoryManagementQueryKeys.all, "list"] as const,
  list: (params: { typeId: number; pageSize: number }) =>
    [...categoryManagementQueryKeys.lists(), params] as const,
  periodList: (params: {
    typeId: number;
    pageSize: number;
    startDate: string;
    endDate: string;
  }) => [...categoryManagementQueryKeys.lists(), "periodList", params] as const,
  details: () => [...categoryManagementQueryKeys.all, "detail"] as const,
  detail: (id: string) =>
    [...categoryManagementQueryKeys.details(), id] as const,
};

export const transactionManagementQueryKeys = {
  all: [QueryKeyModule.TRANSACTION_MANAGEMENT] as const,
  lists: () => [...transactionManagementQueryKeys.all, "list"] as const,
  dateRangeTotals: (params: {
    startDate: string;
    endDate: string;
    accountId?: string;
  }) =>
    [
      ...transactionManagementQueryKeys.lists(),
      "dateRangeTotals",
      params,
    ] as const,
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
  categoryDateRangeSummary: (params: {
    categoryId: string;
    startDate: string;
    endDate: string;
  }) =>
    [
      ...transactionManagementQueryKeys.lists(),
      "categoryDateRangeSummary",
      params,
    ] as const,
  list: (params: {
    pageSize: number;
    startDate: string;
    endDate: string;
    accountId?: string;
    categoryId?: string;
  }) => [...transactionManagementQueryKeys.lists(), params] as const,
  details: () => [...transactionManagementQueryKeys.all, "detail"] as const,
  detail: (id: string) =>
    [...transactionManagementQueryKeys.details(), id] as const,
};

export const invalidateQuery = (queryClient: QueryClient, queryKey: QueryKey) =>
  queryClient.invalidateQueries({ queryKey });
