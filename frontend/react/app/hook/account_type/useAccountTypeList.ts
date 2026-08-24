import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import type { AppIconProps } from "../../components/AppIcon";
import type { AppListCardItemType } from "../../components/AppListCardView";
import { AppToast } from "../../components/AppToast";
import { accountTypeQueryKeys } from "../../constants/queryKeys";
import { DEFAULT_PAGE_SIZE } from "../../constants/size";
import { ACCOUNT_TYPE_DETAIL_URL } from "../../constants/urls";
import { getAccTypeList } from "../../sql/service/accTypeService";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { useTranslation } from "../../i18n/helper";

export default function useAccountTypeList() {
  const { t } = useTranslation();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: accountTypeQueryKeys.list({ pageSize: DEFAULT_PAGE_SIZE }),
    queryFn: ({ pageParam }) => getAccTypeList(pageParam, DEFAULT_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === DEFAULT_PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const accountTypeItems = useMemo<AppListCardItemType[]>(
    () =>
      data?.pages.flat().map((item) => ({
        id: item.id,
        label: item.is_system ? t(item.label) : item.label,
        icon: item.icon as AppIconProps["name"],
        isEditable: !Boolean(item.is_system),
      })) ?? [],
    [data, t],
  );

  useEffect(() => {
    if (!error) return;
    console.error(
      DEBUG_TAG.ACCOUNT_TYPE,
      "Error when getting account type list",
      error,
    );
  }, [error]);

  const onPress = (item: AppListCardItemType) => {
    if (!item.isEditable) {
      AppToast.error({
        title: "Not Editable",
        message: "System-created types cannot be edited.",
      });
      return;
    }

    router.push({ pathname: ACCOUNT_TYPE_DETAIL_URL, params: { id: item.id } });
  };

  const onLoadMore = () => {
    if (isFetchingNextPage || !hasNextPage) return;
    debugLog(DEBUG_TAG.ACCOUNT_TYPE, "Fetching next list page");
    void fetchNextPage();
  };

  const onRefresh = async () => {
    debugLog(DEBUG_TAG.ACCOUNT_TYPE, "Refreshing list");
    await refetch();
  };

  return {
    accountTypeItems,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    onLoadMore,
    onPress,
    onRefresh,
  };
}
