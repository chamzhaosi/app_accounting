import { useQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  ProgressBar,
  Surface,
  Text,
} from "react-native-paper";
import { PieChart } from "react-native-gifted-charts";
import AppButton, {
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppIcon, { AppIconProps } from "../../components/AppIcon";
import AppIconButton from "../../components/AppIconButton";
import AppMonthNavigator from "../../components/AppMonthNavigator";
import AppSwipePager from "../../components/AppSwipePager";
import AppView from "../../components/AppView";
import { budgetQueryKeys } from "../../constants/queryKeys";
import { BUDGET_SWIPE_CARD_HEIGHT } from "../../constants/size";
import {
  BUDGET_CATEGORY_DETAIL_URL,
  BUDGET_MANAGEMENT_URL,
} from "../../constants/urls";
import { getBudgetOverview } from "../../sql/service/budgetService";
import type { BudgetOverviewType } from "../../sql/types/budgetType";
import { useThemeStore } from "../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../stores/useAmountPrivacyStore";
import { getMonthEndKey, getMonthKey } from "../../utils/date";
import { DEBUG_TAG } from "../../utils/debugLog";
import { formatPrivateAmount, MASKED_AMOUNT } from "../../utils/number";

export default function Budget() {
  const { THEME } = useThemeStore();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const [month, setMonth] = useState(getMonthKey);
  const isCurrentMonth = month === getMonthKey();
  const query = useQuery({
    queryKey: budgetQueryKeys.month(month),
    queryFn: () => getBudgetOverview(month),
  });

  useEffect(() => {
    if (query.error)
      console.error(DEBUG_TAG.BUDGET, "Error when loading budget", query.error);
  }, [query.error]);

  const openManagement = () => router.push(BUDGET_MANAGEMENT_URL as Href);

  if (query.isLoading) {
    return (
      <AppView className="items-center justify-center">
        <ActivityIndicator size="large" />
      </AppView>
    );
  }

  if (query.isError) {
    return (
      <AppView
        isSafe
        edges={["top"]}
        className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow"
      >
        <Surface
          elevation={1}
          style={[
            styles.emptyCard,
            { backgroundColor: THEME.surfaceContainer },
          ]}
        >
          <AppMonthNavigator month={month} onChange={setMonth} />
          <AppIcon name="CircleAlert" size={64} color={THEME.error} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Unable to load budget
          </Text>
          <AppButton
            {...SUBMIT_BTN_CONTENT_STYLE}
            onPress={() => void query.refetch()}
            style={styles.emptyButton}
          >
            Retry
          </AppButton>
        </Surface>
      </AppView>
    );
  }

  const overview = query.data;
  const overallProgress = overview
    ? Math.min(overview.spentAmount / overview.budget.total_budget, 1)
    : 0;
  const overallColor = overview
    ? getProgressColor(
        overview.spentAmount / overview.budget.total_budget,
        THEME,
      )
    : THEME.primary;
  const expenseColorByCategoryId = new Map(
    (overview
      ? [...overview.categories]
          .filter((category) => category.spent_amount > 0)
          .sort(sortCategoriesBySpent)
      : []
    ).map((category, index, categories) => [
      category.category_id,
      PIE_COLORS[
        (categories.length > 6 && index >= 5 ? 5 : index) % PIE_COLORS.length
      ],
    ]),
  );
  const orderedCategories = overview
    ? [...overview.categories].sort(sortCategoriesByProgress)
    : [];

  return (
    <AppView
      isSafe
      edges={["top"]}
      className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow"
    >
      {!overview ? (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={query.refetch}
            />
          }
        >
          <Surface
            elevation={1}
            style={[
              styles.emptyCard,
              { backgroundColor: THEME.surfaceContainer },
            ]}
          >
            <AppMonthNavigator month={month} onChange={setMonth} />
            <AppIcon
              name="HandCoins"
              size={72}
              color={THEME.onSurfaceVariant}
            />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              No budget for this month
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.emptyText, { color: THEME.onSurfaceVariant }]}
            >
              {isCurrentMonth
                ? "Set a monthly total and allocate it across your expense categories."
                : "Budgets follow the latest active plan when each new month begins."}
            </Text>
            {isCurrentMonth && (
              <AppButton
                {...SUBMIT_BTN_CONTENT_STYLE}
                onPress={openManagement}
                style={styles.emptyButton}
              >
                Create Budget
              </AppButton>
            )}
          </Surface>
        </ScrollView>
      ) : (
        <>
          <AppSwipePager>
            <Surface
              elevation={2}
              style={[
                styles.overviewCard,
                { backgroundColor: THEME.primaryContainer },
              ]}
            >
              <AppMonthNavigator month={month} onChange={setMonth} />
              <View style={styles.titleRow}>
                <View style={styles.flex}>
                  <Text variant="labelLarge">Monthly budget</Text>
                  <Text variant="headlineLarge">
                    {formatPrivateAmount(
                      overview.budget.total_budget,
                      areAmountsVisible,
                    )}
                  </Text>
                </View>
                {!overview.budget.is_active && (
                  <View
                    style={[
                      styles.pausedBadge,
                      { backgroundColor: THEME.surfaceContainerHighest },
                    ]}
                  >
                    <Text variant="labelMedium">Paused</Text>
                  </View>
                )}
              </View>
              <ProgressBar
                progress={overallProgress}
                color={overallColor}
                style={styles.overallProgress}
              />
              <View style={styles.statsRow}>
                <Stat
                  label="Spent"
                  value={overview.spentAmount}
                  color={overallColor}
                />
                <Stat
                  label={
                    overview.remainingAmount >= 0 ? "Remaining" : "Overspent"
                  }
                  value={Math.abs(overview.remainingAmount)}
                  color={
                    overview.remainingAmount < 0 ? THEME.error : THEME.primary
                  }
                />
              </View>
            </Surface>
            <BudgetExpenseDonutChart overview={overview} />
          </AppSwipePager>

          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl
                refreshing={query.isRefetching}
                onRefresh={query.refetch}
              />
            }
          >
            <Surface
              elevation={1}
              style={[
                styles.allocationCard,
                { backgroundColor: THEME.surfaceContainer },
              ]}
            >
              <Stat label="Allocated" value={overview.allocatedAmount} />
              <Stat
                label={
                  overview.overallocatedAmount > 0
                    ? "Overallocated"
                    : "Unallocated"
                }
                value={
                  overview.overallocatedAmount > 0
                    ? overview.overallocatedAmount
                    : overview.unallocatedAmount
                }
                color={
                  overview.overallocatedAmount > 0 ? THEME.error : undefined
                }
              />
            </Surface>

            <View style={styles.sectionHeader}>
              <Text variant="titleLarge">Category progress</Text>
              {isCurrentMonth && (
                <AppIconButton
                  iconName="Settings2"
                  accessibilityLabel="Manage budget"
                  onPress={openManagement}
                  style={styles.manageButton}
                />
              )}
            </View>

            {orderedCategories.map((category) => {
              const ratio = getCategoryProgressRatio(category);
              const remaining =
                category.allocated_amount - category.spent_amount;
              const categoryColor =
                expenseColorByCategoryId.get(category.category_id) ??
                THEME.outline;
              const progressLabel = getCategoryProgressLabel(category);
              return (
                <TouchableOpacity
                  key={category.allocation_id}
                  onPress={() =>
                    router.push({
                      pathname: BUDGET_CATEGORY_DETAIL_URL,
                      params: {
                        id: category.category_id,
                        startDate: month,
                        endDate: getMonthEndKey(month),
                      },
                    } as Href)
                  }
                >
                  <Surface
                    elevation={0}
                    style={[
                      styles.categoryCard,
                      { backgroundColor: THEME.surfaceContainer },
                    ]}
                  >
                    <View style={styles.categoryTitleRow}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: THEME.surfaceContainerHighest },
                        ]}
                      >
                        <AppIcon
                          name={category.icon as AppIconProps["name"]}
                          size={22}
                          color={categoryColor}
                        />
                      </View>
                      <View style={styles.flex}>
                        <Text variant="titleMedium">{category.label}</Text>
                        <Text
                          variant="bodySmall"
                          style={{ color: THEME.onSurfaceVariant }}
                        >
                          {formatPrivateAmount(
                            category.spent_amount,
                            areAmountsVisible,
                          )}{" "}
                          of{" "}
                          {formatPrivateAmount(
                            category.allocated_amount,
                            areAmountsVisible,
                          )}{" "}
                          · {progressLabel}
                        </Text>
                      </View>
                      <Text
                        variant="titleMedium"
                        style={{
                          color: remaining < 0 ? THEME.error : categoryColor,
                        }}
                      >
                        {areAmountsVisible
                          ? remaining >= 0
                            ? formatPrivateAmount(remaining, true)
                            : `-${formatPrivateAmount(-remaining, true)}`
                          : MASKED_AMOUNT}
                      </Text>
                    </View>
                    <ProgressBar
                      progress={Math.min(ratio, 1)}
                      color={categoryColor}
                      style={styles.categoryProgress}
                    />
                  </Surface>
                </TouchableOpacity>
              );
            })}
            {overview.categories.length === 0 && (
              <Text
                variant="bodyLarge"
                style={[
                  styles.noAllocations,
                  { color: THEME.onSurfaceVariant },
                ]}
              >
                No category allocations for this month.
              </Text>
            )}
          </ScrollView>
        </>
      )}
    </AppView>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  return (
    <View style={styles.stat}>
      <Text variant="labelMedium">{label}</Text>
      <Text variant="titleLarge" style={color ? { color } : undefined}>
        {formatPrivateAmount(value, areAmountsVisible)}
      </Text>
    </View>
  );
}

const PIE_COLORS = [
  "#006878",
  "#C62828",
  "#D99A00",
  "#6A5ACD",
  "#16803D",
  "#D05A9B",
  "#3F7CAC",
  "#A05A2C",
];

type BudgetCategory = BudgetOverviewType["categories"][number];

const sortCategoriesBySpent = (a: BudgetCategory, b: BudgetCategory) =>
  b.spent_amount - a.spent_amount || a.label.localeCompare(b.label);

const getCategoryProgressRatio = (category: BudgetCategory) => {
  if (category.allocated_amount > 0)
    return category.spent_amount / category.allocated_amount;
  return category.spent_amount > 0 ? Number.POSITIVE_INFINITY : 0;
};

const sortCategoriesByProgress = (a: BudgetCategory, b: BudgetCategory) => {
  const aRatio = getCategoryProgressRatio(a);
  const bRatio = getCategoryProgressRatio(b);
  if (aRatio === bRatio) return sortCategoriesBySpent(a, b);
  return bRatio - aRatio;
};

const getCategoryProgressLabel = (category: BudgetCategory) => {
  if (category.allocated_amount <= 0)
    return category.spent_amount > 0 ? "Unbudgeted" : "0.0%";
  return `${(getCategoryProgressRatio(category) * 100).toFixed(1)}%`;
};

function BudgetExpenseDonutChart({
  overview,
}: {
  overview: BudgetOverviewType;
}) {
  const { THEME } = useThemeStore();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const categories = overview.categories
    .filter((category) => category.spent_amount > 0)
    .sort(sortCategoriesBySpent);
  const chartCategories =
    categories.length <= 6
      ? categories
      : [
          ...categories.slice(0, 5),
          {
            label: "Other",
            spent_amount: categories
              .slice(5)
              .reduce((sum, category) => sum + category.spent_amount, 0),
          },
        ];
  const activeIndex = Math.min(
    selectedIndex,
    Math.max(chartCategories.length - 1, 0),
  );
  const selectedCategory = chartCategories[activeIndex];
  const selectedPercentage =
    selectedCategory && overview.spentAmount
      ? (selectedCategory.spent_amount / overview.spentAmount) * 100
      : 0;
  const pieData = chartCategories.map((category, index) => ({
    value: category.spent_amount,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

  return (
    <Surface
      elevation={1}
      style={[
        styles.expenseDonutCard,
        { backgroundColor: THEME.surfaceContainerHigh },
      ]}
    >
      <Text variant="titleMedium" style={styles.expenseDonutTitle}>
        Expense breakdown
      </Text>
      {chartCategories.length ? (
        <View style={styles.expenseDonutContent}>
          <PieChart
            data={pieData}
            donut
            radius={68}
            innerRadius={44}
            innerCircleColor={THEME.surfaceContainerHigh}
            strokeWidth={2}
            strokeColor={THEME.surfaceContainerHigh}
            onPress={(_: unknown, index: number) => setSelectedIndex(index)}
            isAnimated
            centerLabelComponent={() => (
              <View style={styles.expenseDonutCenter}>
                <Text
                  variant="labelSmall"
                  style={{ color: THEME.onSurfaceVariant }}
                >
                  Spent
                </Text>
                <Text variant="titleSmall" style={styles.expenseDonutTotal}>
                  {formatPrivateAmount(overview.spentAmount, areAmountsVisible)}
                </Text>
              </View>
            )}
          />
          {selectedCategory && (
            <View
              style={[
                styles.expenseDonutSelection,
                { backgroundColor: THEME.surfaceContainerHighest },
              ]}
            >
              <View
                style={[
                  styles.expenseDonutDot,
                  {
                    backgroundColor:
                      PIE_COLORS[activeIndex % PIE_COLORS.length],
                  },
                ]}
              />
              <Text variant="labelMedium" numberOfLines={1} style={styles.flex}>
                {selectedCategory.label}
              </Text>
              <Text variant="labelMedium" style={styles.expenseDonutAmount}>
                {formatPrivateAmount(
                  selectedCategory.spent_amount,
                  areAmountsVisible,
                )}{" "}
                · {selectedPercentage.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.expenseDonutEmpty}>
          <Text style={{ color: THEME.onSurfaceVariant }}>
            No category expenses this month.
          </Text>
        </View>
      )}
    </Surface>
  );
}

function getProgressColor(
  ratio: number,
  theme: { primary: string; warning: string; error: string },
) {
  if (ratio >= 1) return theme.error;
  if (ratio >= 0.8) return theme.warning;
  return theme.primary;
}

const styles = StyleSheet.create({
  allocationCard: {
    borderRadius: 16,
    flexDirection: "row",
    marginHorizontal: 12,
    marginTop: 10,
    padding: 16,
  },
  categoryCard: {
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 14,
  },
  categoryProgress: { borderRadius: 4, height: 7, marginTop: 12 },
  categoryTitleRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  content: { paddingBottom: 32 },
  emptyButton: { borderRadius: 8, marginTop: 20, width: "100%" },
  emptyCard: {
    alignItems: "center",
    borderRadius: 16,
    margin: 12,
    marginTop: 24,
    padding: 28,
  },
  emptyText: { marginTop: 8, textAlign: "center" },
  emptyTitle: { marginTop: 16 },
  flex: { flex: 1 },
  iconContainer: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  manageButton: { padding: 8 },
  listScroll: { flex: 1 },
  noAllocations: { margin: 24, textAlign: "center" },
  overallProgress: { borderRadius: 4, height: 9, marginTop: 18 },
  overviewCard: {
    borderRadius: 20,
    height: BUDGET_SWIPE_CARD_HEIGHT,
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 20,
  },
  pausedBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  expenseDonutAmount: { fontWeight: "700", marginLeft: 8 },
  expenseDonutCard: {
    borderRadius: 20,
    height: BUDGET_SWIPE_CARD_HEIGHT,
    marginHorizontal: 12,
    marginVertical: 8,
    overflow: "hidden",
    padding: 16,
  },
  expenseDonutCenter: { alignItems: "center", maxWidth: 82 },
  expenseDonutContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "space-evenly",
  },
  expenseDonutDot: { borderRadius: 5, height: 10, marginRight: 7, width: 10 },
  expenseDonutEmpty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  expenseDonutSelection: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    minHeight: 36,
    paddingHorizontal: 12,
    width: "100%",
  },
  expenseDonutTitle: { fontWeight: "700" },
  expenseDonutTotal: { fontWeight: "700", marginTop: 1 },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 12,
    marginBottom: 8,
    marginTop: 20,
  },
  stat: { flex: 1 },
  statsRow: { flexDirection: "row", marginTop: 18 },
  titleRow: { alignItems: "flex-start", flexDirection: "row" },
});
