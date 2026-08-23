import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftRight } from "lucide-react-native";
import React, { useEffect } from "react";
import { useWindowDimensions, View } from "react-native";
import { ActivityIndicator, IconButton } from "react-native-paper";
import type { TabBarProps } from "react-native-tab-view";
import { TabBar, TabView } from "react-native-tab-view";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppView from "../../components/AppView";
import { CATEGORY_MANAGEMENT_CREATE_URL } from "../../constants/urls";
import useCategoryManagementList from "../../hook/category_management/useCategoryManagementList";
import { useThemeStore } from "../../stores/useThemeStore";
import CategoryReorderList from "./_components/CategoryReorderList";
import {
  CATEGORY_MANAGEMENT_TAB_ROUTES,
  CATEGORY_REORDER_HEADER_ICON_SIZE,
  type CategoryManagementTabRoute,
} from "./_components/categoryManagement.constants";

export default function CategoryManagementList() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{
    type?: CategoryManagementTabRoute["key"];
  }>();
  const { THEME } = useThemeStore();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(type === "exp" ? 1 : 0);
  const [adjustingTypeId, setAdjustingTypeId] = React.useState<number>();
  const isAdjusting = adjustingTypeId !== undefined;
  useEffect(() => {
    const requestedIndex = CATEGORY_MANAGEMENT_TAB_ROUTES.findIndex(
      (route) => route.key === type,
    );
    if (requestedIndex >= 0) setIndex(requestedIndex);
  }, [type]);
  const renderTabBar = (props: TabBarProps<CategoryManagementTabRoute>) => (
    <TabBar
      {...props}
      activeColor={THEME.primary}
      inactiveColor={THEME.outline}
      indicatorStyle={{ backgroundColor: THEME.primary }}
      onTabPress={({ preventDefault }) => {
        if (isAdjusting) preventDefault();
      }}
      style={{ backgroundColor: THEME.secondaryContainer }}
    />
  );
  const renderScene = ({ route }: { route: CategoryManagementTabRoute }) => (
    <AppView className="relative">
      <TxnTypeTabView
        isAdjusting={adjustingTypeId === route.typeId}
        onAdjustingChange={(nextIsAdjusting) =>
          setAdjustingTypeId(nextIsAdjusting ? route.typeId : undefined)
        }
        typeId={route.typeId}
      />
      <AppFloatingButton
        icon="plus"
        onPress={() =>
          router.push({
            pathname: CATEGORY_MANAGEMENT_CREATE_URL,
            params: { type: route.key },
          })
        }
        visible={adjustingTypeId !== route.typeId}
      />
    </AppView>
  );
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <IconButton
              accessibilityHint="Select two category cards to swap positions."
              accessibilityLabel="Reorder categories"
              disabled={isAdjusting}
              icon={({ color, size }) => (
                <ArrowLeftRight color={color} size={size} />
              )}
              iconColor={THEME.primary}
              mode="contained-tonal"
              onPress={() =>
                setAdjustingTypeId(CATEGORY_MANAGEMENT_TAB_ROUTES[index].typeId)
              }
              size={CATEGORY_REORDER_HEADER_ICON_SIZE}
              style={{ margin: 0 }}
            />
          ),
        }}
      />
      <TabView
        renderTabBar={renderTabBar}
        navigationState={{ index, routes: CATEGORY_MANAGEMENT_TAB_ROUTES }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        swipeEnabled={!isAdjusting}
      />
    </>
  );
}

type TxnTypeTabViewProps = {
  isAdjusting: boolean;
  onAdjustingChange: (isAdjusting: boolean) => void;
  typeId: number;
};

function TxnTypeTabView({
  isAdjusting,
  onAdjustingChange,
  typeId,
}: TxnTypeTabViewProps) {
  const logic = useCategoryManagementList(typeId);
  if (logic.isLoading)
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  return (
    <CategoryReorderList
      data={logic.categoryItems}
      hasOrderChanges={logic.hasOrderChanges}
      isAdjusting={isAdjusting}
      isFetchingNextPage={logic.isFetchingNextPage}
      isReordering={logic.isReordering}
      isRefreshing={logic.isRefetching && !logic.isFetchingNextPage}
      onCancel={() => {
        logic.onCancelOrder();
        onAdjustingChange(false);
      }}
      onLoadMore={logic.onLoadMore}
      onOrderChange={logic.onOrderChange}
      onPress={logic.onPress}
      onRefresh={logic.onRefresh}
      onSave={async () => {
        if (await logic.onSaveOrder()) onAdjustingChange(false);
      }}
    />
  );
}
