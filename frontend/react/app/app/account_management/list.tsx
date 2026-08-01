import { useInfiniteQuery } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AppFloatingButton from "../../components/AppFloatingButton";
import { AppIconProps } from "../../components/AppIcon";
import AppListView, { AppListItemType } from "../../components/AppListView";
import AppView from "../../components/AppView";
import { accountManagementQueryKeys } from "../../constants/queryKeys";
import {
  ACCOUNT_MANAGEMENT_BASE_URL,
  ACCOUNT_MANAGEMENT_CREATE_URL,
} from "../../constants/urls";
import { getAccMgmtList } from "../../sql/service/accMgmtService";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

const PAGE_SIZE = 40;

export default function AccountManagementList() {
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
    queryKey: accountManagementQueryKeys.list({ pageSize: PAGE_SIZE }),
    queryFn: ({ pageParam }) => getAccMgmtList(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const accMgmtList = useMemo<AppListItemType[]>(
    () =>
      data?.pages
        .flat()
        .map((item) => ({
          id: item.id,
          icon: item.type_icon as AppIconProps["name"],
          label: item.label,
          descriptions: item.descriptions ?? undefined,
        })) ?? [],
    [data],
  );

  useFocusEffect(
    useCallback(() => {
      debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT, "Refetching account list on focus");
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (!error) return;

    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when getting account list",
      error,
    );
  }, [error]);

  const onLoadMore = () => {
    if (isFetchingNextPage || !hasNextPage) return;

    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT, "Fetching next account page");
    fetchNextPage();
  };

  const onRefresh = async () => {
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT, "Refreshing account list");
    await refetch();
  };

  if (isLoading)
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size={"large"} />
      </View>
    );

  return (
    <AppView className="relative">
      <AppListView
        data={accMgmtList}
        onPress={(item) =>
          router.push(`${ACCOUNT_MANAGEMENT_BASE_URL}/${item.id}`)
        }
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={onRefresh}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
      />
      <AppFloatingButton
        icon="plus"
        onPress={() => router.push(ACCOUNT_MANAGEMENT_CREATE_URL)}
      />
    </AppView>
  );
}
