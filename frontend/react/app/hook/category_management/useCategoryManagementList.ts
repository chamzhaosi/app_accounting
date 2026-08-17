import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import type { AppIconProps } from "../../components/AppIcon";
import type { AppListCardItemType } from "../../components/AppListCardView";
import { AppToast } from "../../components/AppToast";
import { categoryManagementQueryKeys } from "../../constants/queryKeys";
import { DEFAULT_PAGE_SIZE } from "../../constants/size";
import { CATEGORY_MANAGEMENT_DETAIL_URL } from "../../constants/urls";
import { getCategoryMgmtList } from "../../sql/service/categoryMgmtService";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

export default function useCategoryManagementList(typeId: number) {
  const query = useInfiniteQuery({
    queryKey: categoryManagementQueryKeys.list({
      typeId,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    queryFn: ({ pageParam }) =>
      getCategoryMgmtList(typeId, pageParam, DEFAULT_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === DEFAULT_PAGE_SIZE ? allPages.length + 1 : undefined,
  });
  const categoryItems = useMemo<AppListCardItemType[]>(
    () =>
      query.data?.pages.flat().map((item) => ({
        id: item.id,
        icon: item.icon as AppIconProps["name"],
        label: item.label,
        description: item.descriptions ?? undefined,
        isEditable: !Boolean(item.is_system),
      })) ?? [],
    [query.data],
  );

  useEffect(() => {
    if (query.error)
      console.error(
        DEBUG_TAG.CATEGORY_MANAGEMENT,
        "Error when getting category list",
        query.error,
      );
  }, [query.error]);

  const onPress = (item: AppListCardItemType) => {
    if (item.isEditable === false) {
      AppToast.error({
        title: "Not Editable",
        message: "System-created categories cannot be edited.",
      });
      return;
    }
    router.push({
      pathname: CATEGORY_MANAGEMENT_DETAIL_URL,
      params: { id: item.id },
    });
  };
  const onLoadMore = () => {
    if (query.isFetchingNextPage || !query.hasNextPage) return;
    debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT, "Fetching next category page", {
      typeId,
    });
    void query.fetchNextPage();
  };
  const onRefresh = async () => {
    debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT, "Refreshing category list", {
      typeId,
    });
    await query.refetch();
  };
  return {
    categoryItems,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    onLoadMore,
    onPress,
    onRefresh,
  };
}
