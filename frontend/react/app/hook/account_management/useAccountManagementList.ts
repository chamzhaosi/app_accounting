import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import type { AppIconProps } from "../../components/AppIcon";
import type { AppListItemType } from "../../components/AppListView";
import { accountManagementQueryKeys } from "../../constants/queryKeys";
import { DEFAULT_PAGE_SIZE } from "../../constants/size";
import { getAccMgmtList } from "../../sql/service/accMgmtService";
import { useAmountPrivacyStore } from "../../stores/useAmountPrivacyStore";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { formatPrivateAmount } from "../../utils/number";

export default function useAccountManagementList() {
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const query = useInfiniteQuery({
    queryKey: accountManagementQueryKeys.list({ pageSize: DEFAULT_PAGE_SIZE }),
    queryFn: ({ pageParam }) => getAccMgmtList(pageParam, DEFAULT_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === DEFAULT_PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const accountItems = useMemo<AppListItemType[]>(
    () =>
      query.data?.pages.flat().map((item) => ({
        id: item.id,
        icon: item.type_icon as AppIconProps["name"],
        label: item.label,
        descriptions: item.descriptions ?? undefined,
        rightLabel: formatPrivateAmount(
          item.current_balance,
          areAmountsVisible,
        ),
      })) ?? [],
    [areAmountsVisible, query.data],
  );

  useEffect(() => {
    if (!query.error) return;
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when getting account list",
      query.error,
    );
  }, [query.error]);

  const onLoadMore = () => {
    if (query.isFetchingNextPage || !query.hasNextPage) return;
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT, "Fetching next account page");
    void query.fetchNextPage();
  };

  const onRefresh = async () => {
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT, "Refreshing account list");
    await query.refetch();
  };

  return {
    accountItems,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    onLoadMore,
    onRefresh,
  };
}
