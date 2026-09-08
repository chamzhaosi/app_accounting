import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { getActiveBookQueryScope } from "../stores/useBookStore";

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
  BOOK = "book",
}

const bookScope = () => ["book", getActiveBookQueryScope()] as const;

export const bookQueryKeys = {
  all: [QueryKeyModule.BOOK] as const,
  lists: () => [...bookQueryKeys.all, "list"] as const,
  list: (includeInactive = true) =>
    [...bookQueryKeys.lists(), { includeInactive }] as const,
  details: () => [...bookQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...bookQueryKeys.details(), id] as const,
};

export const transactionSearchQueryKeys = {
  all: [QueryKeyModule.TRANSACTION_SEARCH] as const,
  results: () => [...transactionSearchQueryKeys.all, "result"] as const,
  result: (params: {
    keyword: string;
    filters: Record<string, string | string[] | undefined>;
    pageSize: number;
  }) =>
    [...transactionSearchQueryKeys.results(), ...bookScope(), params] as const,
  filterOptions: () =>
    [
      ...transactionSearchQueryKeys.all,
      "filterOptions",
      ...bookScope(),
    ] as const,
};

export const currencyManagementQueryKeys = {
  all: [QueryKeyModule.CURRENCY_MANAGEMENT] as const,
  preferences: () =>
    [
      ...currencyManagementQueryKeys.all,
      "preferences",
      ...bookScope(),
    ] as const,
};

export const accountSettingsQueryKeys = {
  all: [QueryKeyModule.ACCOUNT_SETTINGS] as const,
  detail: () => [...accountSettingsQueryKeys.all, "detail"] as const,
};

export const budgetQueryKeys = {
  all: [QueryKeyModule.BUDGET] as const,
  plans: () => [...budgetQueryKeys.all, "plan"] as const,
  planList: () => [...budgetQueryKeys.plans(), "list", ...bookScope()] as const,
  plan: (id: string) =>
    [...budgetQueryKeys.plans(), "detail", ...bookScope(), id] as const,
  months: () => [...budgetQueryKeys.all, "month"] as const,
  month: (params: { month: string; currencyCode: string }) =>
    [...budgetQueryKeys.months(), ...bookScope(), params] as const,
  dailyRemaining: (params: {
    startDate: string;
    endDate: string;
    currencyCode: string;
  }) =>
    [
      ...budgetQueryKeys.months(),
      "dailyRemaining",
      ...bookScope(),
      params,
    ] as const,
  management: (planId?: string) =>
    [
      ...budgetQueryKeys.all,
      "management",
      ...bookScope(),
      planId ?? "create",
    ] as const,
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
    [
      ...accountManagementQueryKeys.lists(),
      "assetBalance",
      ...bookScope(),
    ] as const,
  assetBalance: (currencyCode?: string) =>
    currencyCode
      ? ([...accountManagementQueryKeys.assetBalances(), currencyCode] as const)
      : accountManagementQueryKeys.assetBalances(),
  list: (params: {
    pageSize: number;
    includeInactive?: boolean;
    currencyCode?: string;
  }) =>
    [...accountManagementQueryKeys.lists(), ...bookScope(), params] as const,
  typeBalanceTotals: () =>
    [
      ...accountManagementQueryKeys.lists(),
      "typeBalanceTotals",
      ...bookScope(),
    ] as const,
  selectableList: (params: { pageSize: number }) =>
    [
      ...accountManagementQueryKeys.lists(),
      "selectable",
      ...bookScope(),
      params,
    ] as const,
  details: () => [...accountManagementQueryKeys.all, "detail"] as const,
  detail: (id: string) =>
    [...accountManagementQueryKeys.details(), ...bookScope(), id] as const,
};

export const creditCardQueryKeys = {
  all: [QueryKeyModule.CREDIT_CARD] as const,
  cycles: () => [...creditCardQueryKeys.all, "cycle"] as const,
  currentCycle: (accountId: string) =>
    [
      ...creditCardQueryKeys.cycles(),
      ...bookScope(),
      accountId,
      "current",
    ] as const,
};

export const categoryManagementQueryKeys = {
  all: [QueryKeyModule.CATEGORY_MANAGEMENT] as const,
  lists: () => [...categoryManagementQueryKeys.all, "list"] as const,
  feeList: () =>
    [...categoryManagementQueryKeys.lists(), "fees", ...bookScope()] as const,
  list: (params: { typeId: number; pageSize: number }) =>
    [...categoryManagementQueryKeys.lists(), ...bookScope(), params] as const,
  periodList: (params: {
    typeId: number;
    pageSize: number;
    startDate: string;
    endDate: string;
    currencyCode?: string;
  }) =>
    [
      ...categoryManagementQueryKeys.lists(),
      "periodList",
      ...bookScope(),
      params,
    ] as const,
  details: () => [...categoryManagementQueryKeys.all, "detail"] as const,
  detail: (id: string) =>
    [...categoryManagementQueryKeys.details(), ...bookScope(), id] as const,
};

export const transactionManagementQueryKeys = {
  all: [QueryKeyModule.TRANSACTION_MANAGEMENT] as const,
  lists: () => [...transactionManagementQueryKeys.all, "list"] as const,
  frequentDescriptions: (categoryId: string, searchText = "") =>
    [
      ...transactionManagementQueryKeys.lists(),
      "frequentDescriptions",
      ...bookScope(),
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
      ...bookScope(),
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
      ...bookScope(),
      params,
    ] as const,
  dailyTotals: (params: {
    startDate: string;
    endDate: string;
    currencyCode: string;
  }) =>
    [
      ...transactionManagementQueryKeys.lists(),
      "dailyTotals",
      ...bookScope(),
      params,
    ] as const,
  accountForwardBalance: (params: { accountId: string; startDate: string }) =>
    [
      ...transactionManagementQueryKeys.lists(),
      "accountForwardBalance",
      ...bookScope(),
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
      ...bookScope(),
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
      ...bookScope(),
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
      ...bookScope(),
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
      ...bookScope(),
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
  }) =>
    [
      ...transactionManagementQueryKeys.lists(),
      ...bookScope(),
      params,
    ] as const,
  details: () => [...transactionManagementQueryKeys.all, "detail"] as const,
  detail: (id: string) =>
    [...transactionManagementQueryKeys.details(), ...bookScope(), id] as const,
  attachments: (id: string) =>
    [...transactionManagementQueryKeys.detail(id), "attachments"] as const,
};

export const invalidateQuery = (queryClient: QueryClient, queryKey: QueryKey) =>
  queryClient.invalidateQueries({ queryKey });

const BOOK_SCOPED_MODULES = new Set<string>([
  QueryKeyModule.ACCOUNT_MANAGEMENT,
  QueryKeyModule.CATEGORY_MANAGEMENT,
  QueryKeyModule.TRANSACTION_MANAGEMENT,
  QueryKeyModule.BUDGET,
  QueryKeyModule.CREDIT_CARD,
  QueryKeyModule.TRANSACTION_SEARCH,
  QueryKeyModule.CURRENCY_MANAGEMENT,
]);

export const resetBookScopedQueries = async (
  queryClient: QueryClient,
  bookId?: string,
) => {
  const matchesBookScope = ({ queryKey }: { queryKey: QueryKey }) =>
    BOOK_SCOPED_MODULES.has(String(queryKey[0])) &&
    (!bookId ||
      queryKey.some(
        (part, index) => part === "book" && queryKey[index + 1] === bookId,
      ));

  await queryClient.cancelQueries({
    predicate: matchesBookScope,
  });
  queryClient.removeQueries({
    predicate: matchesBookScope,
  });
};
