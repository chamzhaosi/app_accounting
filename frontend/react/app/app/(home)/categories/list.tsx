import { Href, router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import { ActivityIndicator, List, Surface, Text } from "react-native-paper";
import { TabBar, TabBarProps, TabView } from "react-native-tab-view";
import AppDateRangePicker from "../../../components/AppDateRangePicker";
import AppEmpty from "../../../components/AppEmpty";
import AppIcon, { AppIconProps } from "../../../components/AppIcon";
import AppView from "../../../components/AppView";
import { FONTS } from "../../../constants/fonts";
import { CATEGORY_DETAIL_URL } from "../../../constants/urls";
import {
  LIST_ITEM_DESCRIPTION_FONTSIZE,
  LIST_ITEM_TITLE_FONTSIZE,
} from "../../../constants/size";
import useCategoriesList, {
  CategoryHomeTabRoute,
  useCategoryPeriodList,
} from "../../../hook/category_management/useCategoriesList";
import type { CategoryPeriodSummaryRspType } from "../../../sql/types/categoryMgmtType";
import { useThemeStore } from "../../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../../stores/useAmountPrivacyStore";
import { formatPrivateAmount } from "../../../utils/number";
import { useTranslation } from "../../../i18n/helper";
import { getCategoryDisplayLabel } from "../../../hook/category_management/categoryManagementList.utils";

export default function CategoriesList() {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const layout = useWindowDimensions();
  const logic = useCategoriesList();

  const renderTabBar = (props: TabBarProps<CategoryHomeTabRoute>) => (
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
          value={logic.dateRange}
          onChange={logic.setDateRange}
        />
      </Surface>

      <TabView
        style={styles.tabView}
        renderTabBar={renderTabBar}
        navigationState={{
          index: logic.index,
          routes: logic.routes.map((route) => ({
            ...route,
            title: t(route.title),
          })),
        }}
        renderScene={({ route }) => (
          <CategoryPeriodTab
            typeId={route.typeId}
            startDate={logic.startDate}
            endDate={logic.endDate}
          />
        )}
        onIndexChange={logic.setIndex}
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
  const logic = useCategoryPeriodList(typeId, startDate, endDate);
  const amountColor = typeId === 1 ? THEME.primary : THEME.error;

  if (logic.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList<CategoryPeriodSummaryRspType>
      data={logic.categories}
      keyExtractor={(category) => category.id}
      refreshing={logic.isRefetching && !logic.isFetchingNextPage}
      onRefresh={logic.onRefresh}
      onEndReached={logic.onLoadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={[
        styles.listContent,
        logic.categories.length === 0 && styles.emptyListContent,
      ]}
      ListEmptyComponent={<AppEmpty />}
      ListFooterComponent={
        logic.isFetchingNextPage ? (
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
              pathname: CATEGORY_DETAIL_URL,
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
