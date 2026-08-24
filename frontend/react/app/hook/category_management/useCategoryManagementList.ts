import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import type { AppIconProps } from "../../components/AppIcon";
import type { AppListCardItemType } from "../../components/AppListCardView";
import { AppToast } from "../../components/AppToast";
import {
  categoryManagementQueryKeys,
  invalidateQuery,
} from "../../constants/queryKeys";
import { DEFAULT_PAGE_SIZE } from "../../constants/size";
import { CATEGORY_MANAGEMENT_DETAIL_URL } from "../../constants/urls";
import {
  getCategoryMgmtList,
  reorderCategoryMgmt,
} from "../../sql/service/categoryMgmtService";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { getCategoryOrderIds } from "./categoryManagementList.utils";
import { useTranslation } from "../../i18n";
import {
  getCategoryDisplayDescription,
  getCategoryDisplayLabel,
} from "../../utils/category";

export default function useCategoryManagementList(typeId: number) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
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
  const queriedCategoryItems = useMemo<AppListCardItemType[]>(
    () =>
      query.data?.pages.flat().map((item) => {
        const translationKey = item.translation_key;

        return {
          id: item.id,
          icon: item.icon as AppIconProps["name"],
          label: getCategoryDisplayLabel(item.label, translationKey, t),
          description: getCategoryDisplayDescription(
            item.descriptions,
            translationKey,
            t,
          ),
          isEditable: !Boolean(item.is_system),
        };
      }) ?? [],
    [query.data, t],
  );
  const [categoryItems, setCategoryItems] = useState<AppListCardItemType[]>([]);
  const hasOrderChanges = useMemo(
    () =>
      getCategoryOrderIds(categoryItems).join(",") !==
      getCategoryOrderIds(queriedCategoryItems).join(","),
    [categoryItems, queriedCategoryItems],
  );
  const reorderMutation = useMutation({
    mutationFn: async (orderedItems: AppListCardItemType[]) => {
      const errorMessage = await reorderCategoryMgmt(
        typeId,
        getCategoryOrderIds(orderedItems),
      );
      if (errorMessage) throw new Error(errorMessage);
    },
    onSuccess: () =>
      invalidateQuery(queryClient, categoryManagementQueryKeys.lists()),
  });

  useEffect(() => {
    setCategoryItems(queriedCategoryItems);
  }, [queriedCategoryItems]);

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
  const onOrderChange = (orderedItems: AppListCardItemType[]) => {
    setCategoryItems(orderedItems);
  };
  const onCancelOrder = () => {
    setCategoryItems(queriedCategoryItems);
  };
  const onSaveOrder = async () => {
    if (!hasOrderChanges) return true;

    try {
      await reorderMutation.mutateAsync(categoryItems);
      AppToast.success({ message: "Category order updated." });
      return true;
    } catch (e) {
      console.error(
        DEBUG_TAG.CATEGORY_MANAGEMENT,
        "Error when reordering categories",
        e,
      );
      AppToast.error({ message: "Unable to update category order." });
      return false;
    }
  };
  return {
    categoryItems,
    hasOrderChanges,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isReordering: reorderMutation.isPending,
    onCancelOrder,
    onLoadMore,
    onOrderChange,
    onPress,
    onRefresh,
    onSaveOrder,
  };
}
