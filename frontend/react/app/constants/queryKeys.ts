import type { QueryClient, QueryKey } from "@tanstack/react-query";

export enum QueryKeyModule {
  ACCOUNT_MANAGEMENT = "accountManagement",
  ACCOUNT_TYPE = "accountType",
}

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
  list: (params: { pageSize: number }) =>
    [...accountManagementQueryKeys.lists(), params] as const,
  details: () => [...accountManagementQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...accountManagementQueryKeys.details(), id] as const,
};

export const invalidateQuery = (
  queryClient: QueryClient,
  queryKey: QueryKey,
) => queryClient.invalidateQueries({ queryKey });
