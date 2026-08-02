import { useInfiniteQuery } from "@tanstack/react-query";
import { router, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { useWindowDimensions, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { Route, TabBar, TabBarProps, TabView } from "react-native-tab-view";
import AppFloatingButton from "../../components/AppFloatingButton";
import { AppIconProps } from "../../components/AppIcon";
import AppListCardView, {
  AppListCardItemType,
} from "../../components/AppListCardView";
import { AppToast } from "../../components/AppToast";
import AppView from "../../components/AppView";
import { categoryManagementQueryKeys } from "../../constants/queryKeys";
import {
  CATEGORY_MANAGEMENT_CREATE_URL,
  CATEGORY_MANAGEMENT_DETAIL_URL,
} from "../../constants/urls";
import { getCategoryMgmtList } from "../../sql/service/categoryMgmtService";
import { useThemeStore } from "../../stores/useThemeStore";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

const PAGE_SIZE = 40;

type TabRoute = Route & {
  key: "inc" | "exp";
  title: string;
  typeId: number;
};

const ROUTES: TabRoute[] = [
  { key: "inc", title: "Income", typeId: 1 },
  { key: "exp", title: "Expense", typeId: 2 },
];

export default function CategoryManagementList() {
  const router = useRouter();
  const { THEME } = useThemeStore();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  const renderTabBar = (props: TabBarProps<TabRoute>) => (
    <TabBar
      {...props}
      activeColor={THEME.primary}
      inactiveColor={THEME.outline}
      indicatorStyle={{ backgroundColor: THEME.primary }}
      style={{ backgroundColor: THEME.secondaryContainer }}
    />
  );

  const renderScene = ({ route }: { route: TabRoute }) => (
    <AppView className="relative">
      <TxnTypeTabView typeId={route.typeId} />
      <AppFloatingButton
        icon="plus"
        onPress={() =>
          router.push({
            pathname: CATEGORY_MANAGEMENT_CREATE_URL,
            params: { type: route.key },
          })
        }
      />
    </AppView>
  );

  return (
    <TabView
      renderTabBar={renderTabBar}
      navigationState={{ index, routes: ROUTES }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  );
}

function TxnTypeTabView({ typeId }: { typeId: number }) {
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
    queryKey: categoryManagementQueryKeys.list({ typeId, pageSize: PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      getCategoryMgmtList(typeId, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const cardItems = useMemo<AppListCardItemType[]>(
    () =>
      data?.pages.flat().map((item) => ({
        id: item.id,
        icon: item.icon as AppIconProps["name"],
        label: item.label,
        description: item.descriptions ?? undefined,
        isEditable: !Boolean(item.is_system),
      })) ?? [],
    [data],
  );

  useEffect(() => {
    if (!error) return;

    console.error(
      DEBUG_TAG.CATEGORY_MANAGEMENT,
      "Error when getting category list",
      error,
    );
  }, [error]);

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
    if (isFetchingNextPage || !hasNextPage) return;

    debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT, "Fetching next category page", {
      typeId,
    });
    fetchNextPage();
  };

  const onRefresh = async () => {
    debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT, "Refreshing category list", {
      typeId,
    });
    await refetch();
  };

  if (isLoading) {
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppListCardView
      data={cardItems}
      onPress={onPress}
      extraCardHeight={-12}
      numberItemInRow={3}
      refreshing={isRefetching && !isFetchingNextPage}
      isLoading={isFetchingNextPage}
      onRefresh={onRefresh}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
    />
  );
}
