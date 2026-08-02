import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AppFloatingButton from "../../components/AppFloatingButton";
import { AppIconProps } from "../../components/AppIcon";
import AppListCardView, {
  AppListCardItemType,
} from "../../components/AppListCardView";
import { AppToast } from "../../components/AppToast";
import AppView from "../../components/AppView";
import {
  ACCOUNT_TYPE_CREATE_URL,
  ACCOUNT_TYPE_DETAIL_URL,
} from "../../constants/urls";
import { accountTypeQueryKeys } from "../../constants/queryKeys";
import { getAccTypeList } from "../../sql/service/accTypeService";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

const PAGE_SIZE = 40;

export default function AccountTypeList() {
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
    queryKey: accountTypeQueryKeys.list({ pageSize: PAGE_SIZE }),
    queryFn: ({ pageParam }) => getAccTypeList(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const accTypeList = useMemo<AppListCardItemType[]>(
    () =>
      data?.pages.flat().map((d) => ({
        id: d.id,
        label: d.label,
        icon: d.icon as AppIconProps["name"],
        isEditable: !Boolean(d.is_system),
      })) ?? [],
    [data],
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

    router.push({
      pathname: ACCOUNT_TYPE_DETAIL_URL,
      params: { id: item.id },
    });
  };

  const onLoadMore = () => {
    if (isFetchingNextPage || !hasNextPage) return;

    debugLog(DEBUG_TAG.ACCOUNT_TYPE, "Fetching next list page");
    fetchNextPage();
  };

  const onRefresh = async () => {
    debugLog(DEBUG_TAG.ACCOUNT_TYPE, "Refreshing list");
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
      <AppListCardView
        data={accTypeList}
        onPress={onPress}
        extraCardHeight={20}
        refreshing={isRefetching && !isFetchingNextPage}
        isLoading={isFetchingNextPage}
        onRefresh={onRefresh}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
      />
      <AppFloatingButton
        icon="plus"
        onPress={() => router.push(ACCOUNT_TYPE_CREATE_URL)}
      />
    </AppView>
  );
}
