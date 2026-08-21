import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useWindowDimensions, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import type { Route, TabBarProps } from "react-native-tab-view";
import { TabBar, TabView } from "react-native-tab-view";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppView from "../../components/AppView";
import { CATEGORY_MANAGEMENT_CREATE_URL } from "../../constants/urls";
import useCategoryManagementList from "../../hook/category_management/useCategoryManagementList";
import { useThemeStore } from "../../stores/useThemeStore";
import DraggableCategoryList from "./_components/DraggableCategoryList";

type TabRoute = Route & { key: "inc" | "exp"; title: string; typeId: number };
const ROUTES: TabRoute[] = [
  { key: "inc", title: "Income", typeId: 1 },
  { key: "exp", title: "Expense", typeId: 2 },
];

export default function CategoryManagementList() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: TabRoute["key"] }>();
  const { THEME } = useThemeStore();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(type === "exp" ? 1 : 0);
  useEffect(() => {
    const requestedIndex = ROUTES.findIndex((route) => route.key === type);
    if (requestedIndex >= 0) setIndex(requestedIndex);
  }, [type]);
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
  const logic = useCategoryManagementList(typeId);
  if (logic.isLoading)
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  return (
    <DraggableCategoryList
      data={logic.categoryItems}
      onPress={logic.onPress}
      isRefreshing={logic.isRefetching && !logic.isFetchingNextPage}
      isFetchingNextPage={logic.isFetchingNextPage}
      isReordering={logic.isReordering}
      onDragEnd={logic.onDragEnd}
      onRefresh={logic.onRefresh}
      onLoadMore={logic.onLoadMore}
    />
  );
}
