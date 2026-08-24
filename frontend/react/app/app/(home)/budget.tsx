import { Href, router } from "expo-router";
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
import { BUDGET_SWIPE_CARD_HEIGHT } from "../../constants/size";
import {
  BUDGET_CATEGORY_DETAIL_URL,
  BUDGET_MANAGEMENT_URL,
} from "../../constants/urls";
import type { BudgetOverviewType } from "../../sql/types/budgetType";
import { BUDGET_PIE_COLORS } from "../../hook/budget_management/budgetOverview.utils";
import useBudgetExpenseDonutChart from "../../hook/budget_management/useBudgetExpenseDonutChart";
import useBudgetOverview from "../../hook/budget_management/useBudgetOverview";
import { useThemeStore } from "../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../stores/useAmountPrivacyStore";
import { absoluteAmount, compareAmounts } from "../../utils/amount";
import { getMonthEndKey } from "../../utils/date";
import { formatPrivateAmount, MASKED_AMOUNT } from "../../utils/number";
import { useTranslation } from "../../i18n/helper";
import { getCategoryDisplayLabel } from "../../hook/category_management/categoryManagementList.utils";

export default function Budget() {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();

  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const logic = useBudgetOverview(THEME);

  const openManagement = () => router.push(BUDGET_MANAGEMENT_URL as Href);

  if (logic.isLoading) {
    return (
      <AppView className="items-center justify-center">
        <ActivityIndicator size="large" />
      </AppView>
    );
  }

  if (logic.isError) {
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
          <AppMonthNavigator month={logic.month} onChange={logic.setMonth} />
          <AppIcon name="CircleAlert" size={64} color={THEME.error} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            {t("Unable to load budget")}
          </Text>
          <AppButton
            {...SUBMIT_BTN_CONTENT_STYLE}
            onPress={logic.onRetry}
            style={styles.emptyButton}
          >
            Retry
          </AppButton>
        </Surface>
      </AppView>
    );
  }

  const overview = logic.overview;

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
              refreshing={logic.isRefetching}
              onRefresh={logic.onRefresh}
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
            <AppMonthNavigator month={logic.month} onChange={logic.setMonth} />
            <AppIcon
              name="HandCoins"
              size={72}
              color={THEME.onSurfaceVariant}
            />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              {t("No budget for this month")}
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.emptyText, { color: THEME.onSurfaceVariant }]}
            >
              {t(
                logic.isCurrentMonth
                  ? "Set a monthly total and allocate it across your expense categories."
                  : "Budgets follow the latest active plan when each new month begins.",
              )}
            </Text>
            {logic.isCurrentMonth && (
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
              <AppMonthNavigator
                month={logic.month}
                onChange={logic.setMonth}
              />
              <View style={styles.titleRow}>
                <View style={styles.flex}>
                  <Text variant="labelLarge">{t("Monthly budget")}</Text>
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
                    <Text variant="labelMedium">{t("Paused")}</Text>
                  </View>
                )}
              </View>
              <ProgressBar
                progress={logic.overallProgress}
                color={logic.overallColor}
                style={styles.overallProgress}
              />
              <View style={styles.statsRow}>
                <Stat
                  label="Spent"
                  value={overview.spentAmount}
                  color={logic.overallColor}
                />
                <Stat
                  label={
                    overview.remainingAmount >= 0 ? "Remaining" : "Overspent"
                  }
                  value={absoluteAmount(overview.remainingAmount)}
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
                refreshing={logic.isRefetching}
                onRefresh={logic.onRefresh}
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
              <Text variant="titleLarge">{t("Category progress")}</Text>
              {logic.isCurrentMonth && (
                <AppIconButton
                  iconName="Settings2"
                  accessibilityLabel={t("Manage budget")}
                  onPress={openManagement}
                  style={styles.manageButton}
                />
              )}
            </View>

            {logic.categories.map((category) => {
              return (
                <TouchableOpacity
                  key={category.allocation_id}
                  onPress={() =>
                    router.push({
                      pathname: BUDGET_CATEGORY_DETAIL_URL,
                      params: {
                        id: category.category_id,
                        startDate: logic.month,
                        endDate: getMonthEndKey(logic.month),
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
                          color={category.color}
                        />
                      </View>
                      <View style={styles.flex}>
                        <Text variant="titleMedium">
                          {getCategoryDisplayLabel(
                            category.label,
                            category.translation_key,
                            t,
                          )}
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={{ color: THEME.onSurfaceVariant }}
                        >
                          {formatPrivateAmount(
                            category.spent_amount,
                            areAmountsVisible,
                          )}{" "}
                          {t("of")}{" "}
                          {formatPrivateAmount(
                            category.allocated_amount,
                            areAmountsVisible,
                          )}{" "}
                          · {t(category.progressLabel)}
                        </Text>
                      </View>
                      <Text
                        variant="titleMedium"
                        style={{
                          color:
                            compareAmounts(category.remainingAmount, 0) < 0
                              ? THEME.error
                              : category.color,
                        }}
                      >
                        {areAmountsVisible
                          ? compareAmounts(category.remainingAmount, 0) >= 0
                            ? formatPrivateAmount(
                                category.remainingAmount,
                                true,
                              )
                            : `-${formatPrivateAmount(
                                absoluteAmount(category.remainingAmount),
                                true,
                              )}`
                          : MASKED_AMOUNT}
                      </Text>
                    </View>
                    <ProgressBar
                      progress={Math.min(category.progressRatio, 1)}
                      color={category.color}
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
                {t("No category allocations for this month.")}
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
  const { t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  return (
    <View style={styles.stat}>
      <Text variant="labelMedium">{t(label)}</Text>
      <Text variant="titleLarge" style={color ? { color } : undefined}>
        {formatPrivateAmount(value, areAmountsVisible)}
      </Text>
    </View>
  );
}

function BudgetExpenseDonutChart({
  overview,
}: {
  overview: BudgetOverviewType;
}) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const logic = useBudgetExpenseDonutChart(overview);

  return (
    <Surface
      elevation={1}
      style={[
        styles.expenseDonutCard,
        { backgroundColor: THEME.surfaceContainerHigh },
      ]}
    >
      <Text variant="titleMedium" style={styles.expenseDonutTitle}>
        {t("Expense breakdown")}
      </Text>
      {logic.chartCategories.length ? (
        <View style={styles.expenseDonutContent}>
          <PieChart
            data={logic.pieData}
            donut
            radius={68}
            innerRadius={44}
            innerCircleColor={THEME.surfaceContainerHigh}
            strokeWidth={2}
            strokeColor={THEME.surfaceContainerHigh}
            onPress={(_: unknown, index: number) =>
              logic.setSelectedIndex(index)
            }
            isAnimated
            centerLabelComponent={() => (
              <View style={styles.expenseDonutCenter}>
                <Text
                  variant="labelSmall"
                  style={{ color: THEME.onSurfaceVariant }}
                >
                  {t("Spent")}
                </Text>
                <Text variant="titleSmall" style={styles.expenseDonutTotal}>
                  {formatPrivateAmount(overview.spentAmount, areAmountsVisible)}
                </Text>
              </View>
            )}
          />
          {logic.selectedCategory && (
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
                      BUDGET_PIE_COLORS[
                        logic.activeIndex % BUDGET_PIE_COLORS.length
                      ],
                  },
                ]}
              />
              <Text variant="labelMedium" numberOfLines={1} style={styles.flex}>
                {"category_id" in logic.selectedCategory
                  ? getCategoryDisplayLabel(
                      logic.selectedCategory.label,
                      logic.selectedCategory.translation_key,
                      t,
                    )
                  : t(logic.selectedCategory.label)}
              </Text>
              <Text variant="labelMedium" style={styles.expenseDonutAmount}>
                {formatPrivateAmount(
                  logic.selectedCategory.spent_amount,
                  areAmountsVisible,
                )}{" "}
                · {logic.selectedPercentage.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.expenseDonutEmpty}>
          <Text style={{ color: THEME.onSurfaceVariant }}>
            {t("No category expenses this month.")}
          </Text>
        </View>
      )}
    </Surface>
  );
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
