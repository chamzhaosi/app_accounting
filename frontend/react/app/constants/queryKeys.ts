import type { QueryClient, QueryKey } from "@tanstack/react-query";

export enum QueryKeyModule {
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

export const invalidateQuery = (
  queryClient: QueryClient,
  queryKey: QueryKey,
) => queryClient.invalidateQueries({ queryKey });
