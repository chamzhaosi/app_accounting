import { useInfiniteQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import { ActivityIndicator, List, Surface, Text } from "react-native-paper";
import { Route, TabBar, TabBarProps, TabView } from "react-native-tab-view";
import AppDateRangePicker, {
  AppDateRangeValue,
} from "../../../components/AppDateRangePicker";
import AppEmpty from "../../../components/AppEmpty";
import AppIcon, { AppIconProps } from "../../../components/AppIcon";
import AppView from "../../../components/AppView";
import { FONTS } from "../../../constants/fonts";
import { categoryManagementQueryKeys } from "../../../constants/queryKeys";
import {
  LIST_ITEM_DESCRIPTION_FONTSIZE,
  LIST_ITEM_TITLE_FONTSIZE,
} from "../../../constants/size";
import { getCategoryPeriodSummaryList } from "../../../sql/service/categoryMgmtService";
import { CategoryPeriodSummaryRspType } from "../../../sql/types/categoryMgmtType";
import { useThemeStore } from "../../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../../stores/useAmountPrivacyStore";
import { DEBUG_TAG, debugLog } from "../../../utils/debugLog";
import { DEFAULT_PAGE_SIZE } from "../../../constants/size";
import { formatDateValue, getCurrentMonthDateRange } from "../../../utils/date";
import { formatPrivateAmount } from "../../../utils/number";
import { useTranslation } from "../../../i18n";
import { getCategoryDisplayLabel } from "../../../utils/category";

type TabRoute = Route & {
  key: "expense" | "income";
  title: string;
  typeId: number;
};

const ROUTES: TabRoute[] = [
  { key: "expense", title: "Expense", typeId: 2 },
  { key: "income", title: "Income", typeId: 1 },
];

export default function CategoriesList() {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [dateRange, setDateRange] = useState<AppDateRangeValue>(
    getCurrentMonthDateRange,
  );
  const startDate = formatDateValue(dateRange.startDate);
  const endDate = formatDateValue(dateRange.endDate);

  const renderTabBar = (props: TabBarProps<TabRoute>) => (
    <TabBar
      {...props}
      activeColor={THEME.primary}
      inactiveColor={THEME.onSurfaceVariant}
      indicatorStyle={{ backgroundColor: THEME.primary, height: 3 }}
      style={{ backgroundColor: THEME.surfaceContainerHigh }}
    />
  );

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
      <Surface
        elevation={1}
        style={[
          styles.dateRangeSurface,
          { backgroundColor: THEME.surfaceContainerHigh },
        ]}
      >
        <AppDateRangePicker
          label="Date Range"
          maxRangeDays={90}
          value={dateRange}
          onChange={setDateRange}
        />
      </Surface>

      <TabView
        style={styles.tabView}
        renderTabBar={renderTabBar}
        navigationState={{
          index,
          routes: ROUTES.map((route) => ({
            ...route,
            title: t(route.title),
          })),
        }}
        renderScene={({ route }) => (
          <CategoryPeriodTab
            typeId={route.typeId}
            startDate={startDate}
            endDate={endDate}
          />
        )}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </AppView>
  );
}

type CategoryPeriodTabProps = {
  typeId: number;
  startDate: string;
  endDate: string;
};

function CategoryPeriodTab({
  typeId,
  startDate,
  endDate,
}: CategoryPeriodTabProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
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
    queryKey: categoryManagementQueryKeys.periodList({
      typeId,
      pageSize: DEFAULT_PAGE_SIZE,
      startDate,
      endDate,
    }),
    queryFn: ({ pageParam }) =>
      getCategoryPeriodSummaryList(
        typeId,
        startDate,
        endDate,
        pageParam,
        DEFAULT_PAGE_SIZE,
      ),
    enabled: Boolean(startDate && endDate),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === DEFAULT_PAGE_SIZE ? allPages.length + 1 : undefined,
  });
  const categories = data?.pages.flat() ?? [];
  const amountColor = typeId === 1 ? THEME.primary : THEME.error;

  useEffect(() => {
    if (!error) return;

    console.error(
      DEBUG_TAG.CATEGORY_MANAGEMENT,
      "Error when loading category period list",
      { typeId, startDate, endDate, error },
    );
  }, [endDate, error, startDate, typeId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList<CategoryPeriodSummaryRspType>
      data={categories}
      keyExtractor={(category) => category.id}
      refreshing={isRefetching && !isFetchingNextPage}
      onRefresh={async () => {
        debugLog(
          DEBUG_TAG.CATEGORY_MANAGEMENT,
          "Refreshing category period list",
          { typeId, startDate, endDate },
        );
        await refetch();
      }}
      onEndReached={() => {
        if (isFetchingNextPage || !hasNextPage) return;
        void fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      contentContainerStyle={[
        styles.listContent,
        categories.length === 0 && styles.emptyListContent,
      ]}
      ListEmptyComponent={<AppEmpty />}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator style={styles.footerLoader} />
        ) : null
      }
      renderItem={({ item: category }) => (
        <List.Item
          centered
          title={getCategoryDisplayLabel(
            category.label,
            category.translation_key,
            t,
          )}
          titleStyle={styles.categoryLabel}
          description={`${category.transaction_count} ${t(
            category.transaction_count === 1 ? "transaction" : "transactions",
          )}`}
          descriptionStyle={styles.categoryDescription}
          style={[
            styles.categoryItem,
            {
              backgroundColor: THEME.surfaceContainer,
              borderBottomColor: THEME.outlineVariant,
            },
          ]}
          rippleColor={THEME.surfaceContainerHighest}
          onPress={() =>
            router.push({
              pathname: "/(home)/categories/[id]",
              params: {
                id: category.id,
                startDate,
                endDate,
              },
            } as Href)
          }
          left={({ style }) => (
            <View
              style={[
                style,
                styles.categoryIconContainer,
                { backgroundColor: THEME.surfaceContainerHighest },
              ]}
            >
              <AppIcon
                name={category.icon as AppIconProps["name"]}
                color={amountColor}
                size={22}
              />
            </View>
          )}
          right={() => (
            <View style={styles.categoryTotalContainer}>
              <Text style={[styles.categoryTotal, { color: amountColor }]}>
                {formatPrivateAmount(category.period_total, areAmountsVisible)}
              </Text>
              <ChevronRight color={THEME.onSurfaceVariant} size={22} />
            </View>
          )}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  dateRangeSurface: {
    borderRadius: 16,
    margin: 12,
    marginBottom: 8,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  categoryItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingLeft: 12,
    paddingRight: 8,
  },
  categoryIconContainer: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  categoryLabel: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
    fontWeight: "600",
  },
  categoryDescription: {
    fontSize: LIST_ITEM_DESCRIPTION_FONTSIZE,
  },
  categoryTotalContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  categoryTotal: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
    fontWeight: "700",
    marginRight: 8,
  },
  footerLoader: {
    marginVertical: 16,
  },
});
