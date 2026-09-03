import { Href, router, useNavigation } from "expo-router";
import { useCallback, useLayoutEffect } from "react";
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
  BUDGET_MANAGEMENT_CREATE_URL,
  BUDGET_MANAGEMENT_DETAIL_URL,
} from "../../constants/urls";
import type { BudgetOverviewType } from "../../sql/types/budgetType";
import { BUDGET_PIE_COLORS } from "../../hook/budget_management/budgetOverview.utils";
import useBudgetExpenseDonutChart from "../../hook/budget_management/useBudgetExpenseDonutChart";
import useBudgetOverview from "../../hook/budget_management/useBudgetOverview";
import useSingleCurrencyMode from "../../hook/currency_management/useSingleCurrencyMode";
import { useThemeStore } from "../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../stores/useAmountPrivacyStore";
import { absoluteAmount, compareAmounts } from "../../utils/amount";
import { getMonthEndKey, getMonthKey } from "../../utils/date";
import {
  formatPrivateLocalizedAmount,
  MASKED_AMOUNT,
} from "../../utils/number";
import { useTranslation } from "../../i18n/helper";
import { getCategoryDisplayLabel } from "../../hook/category_management/categoryManagementList.utils";

export default function Budget() {
  const navigation = useNavigation();
  const { THEME } = useThemeStore();
  const { locale, t } = useTranslation();

  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const logic = useBudgetOverview(THEME);
  const isSingleCurrency = useSingleCurrencyMode();
  const overview = logic.overview;
  const displayAmount = (value: number) =>
    formatPrivateLocalizedAmount(
      value,
      logic.selectedCurrencyCode,
      locale,
      areAmountsVisible,
    );

  const openManagement = useCallback(
    () =>
      router.push(
        (logic.selectedPlanId
          ? BUDGET_MANAGEMENT_DETAIL_URL.replace("[id]", logic.selectedPlanId)
          : BUDGET_MANAGEMENT_CREATE_URL) as Href,
      ),
    [logic.selectedPlanId],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        overview && logic.isCurrentMonth && logic.selectedCurrencyEnabled ? (
          <AppIconButton
            iconName="Settings2"
            accessibilityLabel={t("Manage budget")}
            onPress={openManagement}
            style={{
              ...styles.manageButton,
              backgroundColor: THEME.surfaceContainerHigh,
            }}
          />
        ) : null,
    });
  }, [
    THEME.surfaceContainerHigh,
    logic.isCurrentMonth,
    logic.selectedCurrencyEnabled,
    navigation,
    openManagement,
    overview,
    t,
  ]);

  const currencyNavigator =
    logic.selectedCurrencyCode && !isSingleCurrency ? (
      <Surface
        elevation={0}
        style={[
          styles.currencyCard,
          { backgroundColor: THEME.surfaceContainerHighest },
        ]}
      >
        <View style={styles.currencyNavigator}>
          <AppIconButton
            iconName="ChevronLeft"
            accessibilityLabel={t("Previous currency")}
            disabled={!logic.canSelectPreviousCurrency}
            onPress={logic.previousCurrency}
            style={{
              ...styles.currencyButton,
              backgroundColor: THEME.surfaceContainerHighest,
            }}
          />
          <View style={styles.currencyLabel}>
            <Text
              variant="labelSmall"
              style={{ color: THEME.onSurfaceVariant }}
            >
              {t("Currency")}
            </Text>
            <Text variant="titleMedium" style={styles.currencyCode}>
              {logic.selectedCurrencyCode}
            </Text>
            {!logic.selectedCurrencyEnabled ? (
              <Text variant="labelSmall" style={{ color: THEME.error }}>
                {t("Currency disabled")}
              </Text>
            ) : null}
          </View>
          <AppIconButton
            iconName="ChevronRight"
            accessibilityLabel={t("Next currency")}
            disabled={!logic.canSelectNextCurrency}
            onPress={logic.nextCurrency}
            style={{
              ...styles.currencyButton,
              backgroundColor: THEME.surfaceContainerHighest,
            }}
          />
        </View>
      </Surface>
    ) : null;

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
          <AppMonthNavigator
            month={logic.month}
            maximumMonth={getMonthKey()}
            onChange={logic.setMonth}
          />
          <View style={styles.errorCurrencySelector}>{currencyNavigator}</View>
          <View
            style={[
              styles.errorIconContainer,
              { backgroundColor: THEME.errorContainer },
            ]}
          >
            <AppIcon name="CircleAlert" size={36} color={THEME.error} />
          </View>
          <Text variant="headlineSmall" style={styles.errorTitle}>
            {t("Unable to load budget")}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.errorText, { color: THEME.onSurfaceVariant }]}
          >
            {t(
              "Something went wrong while loading this budget. Try again or choose another currency.",
            )}
          </Text>
          <AppButton
            {...SUBMIT_BTN_CONTENT_STYLE}
            onPress={logic.onRetry}
            style={styles.emptyButton}
          >
            {t("Retry")}
          </AppButton>
        </Surface>
      </AppView>
    );
  }

  return (
    <AppView
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
            <AppMonthNavigator
              month={logic.month}
              maximumMonth={getMonthKey()}
              onChange={logic.setMonth}
            />
            <View style={styles.emptyCurrencyRow}>
              <View style={styles.emptyIconContainer}>
                <AppIcon
                  name="HandCoins"
                  size={72}
                  color={THEME.onSurfaceVariant}
                />
              </View>
              {currencyNavigator}
            </View>
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
                disabled={!logic.selectedCurrencyEnabled}
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
                {
                  backgroundColor: THEME.surfaceContainer,
                  borderColor: THEME.outlineVariant,
                },
              ]}
            >
              <AppMonthNavigator
                month={logic.month}
                maximumMonth={getMonthKey()}
                onChange={logic.setMonth}
              />
              <View style={styles.titleRow}>
                <View style={styles.flex}>
                  <View style={styles.budgetLabelRow}>
                    <Text
                      variant="labelLarge"
                      style={{ color: THEME.onSurfaceVariant }}
                    >
                      {t("Monthly budget")}
                    </Text>
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
                  <Text
                    variant="headlineLarge"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.65}
                    style={styles.budgetAmount}
                  >
                    {displayAmount(overview.budget.total_budget)}
                  </Text>
                </View>
                {currencyNavigator}
              </View>
              <View style={styles.progressHeader}>
                <Text
                  variant="labelMedium"
                  style={{ color: THEME.onSurfaceVariant }}
                >
                  {t("Budget used")}
                </Text>
                <Text
                  variant="labelLarge"
                  style={{ color: logic.overallColor }}
                >
                  {logic.overallProgressLabel}
                </Text>
              </View>
              <ProgressBar
                progress={logic.overallProgress}
                color={logic.overallColor}
                style={[
                  styles.overallProgress,
                  { backgroundColor: THEME.surfaceContainerHighest },
                ]}
              />
              <View style={styles.statsRow}>
                <Stat
                  label="Spent"
                  value={overview.spentAmount}
                  currencyCode={logic.selectedCurrencyCode}
                  color={logic.overallColor}
                  highlighted
                />
                <Stat
                  label={
                    overview.remainingAmount >= 0 ? "Remaining" : "Overspent"
                  }
                  value={absoluteAmount(overview.remainingAmount)}
                  currencyCode={logic.selectedCurrencyCode}
                  color={
                    overview.remainingAmount < 0 ? THEME.error : THEME.primary
                  }
                  highlighted
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
              <Stat
                label="Allocated"
                value={overview.allocatedAmount}
                currencyCode={logic.selectedCurrencyCode}
              />
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
                currencyCode={logic.selectedCurrencyCode}
                color={
                  overview.overallocatedAmount > 0 ? THEME.error : undefined
                }
              />
            </Surface>

            <View style={styles.sectionHeader}>
              <Text variant="titleLarge">{t("Category progress")}</Text>
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
                        currencyCode: logic.selectedCurrencyCode,
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
                          {displayAmount(category.spent_amount)} {t("of")}{" "}
                          {displayAmount(category.allocated_amount)} ·{" "}
                          {t(category.progressLabel)}
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
                            ? formatPrivateLocalizedAmount(
                                category.remainingAmount,
                                logic.selectedCurrencyCode,
                                locale,
                                true,
                              )
                            : `-${formatPrivateLocalizedAmount(
                                absoluteAmount(category.remainingAmount),
                                logic.selectedCurrencyCode,
                                locale,
                                true,
                              )}`
                          : isSingleCurrency
                            ? MASKED_AMOUNT
                            : `${logic.selectedCurrencyCode} ${MASKED_AMOUNT}`}
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
  currencyCode,
  color,
  highlighted = false,
}: {
  label: string;
  value: number;
  currencyCode: string;
  color?: string;
  highlighted?: boolean;
}) {
  const { THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  return (
    <View
      style={[
        styles.stat,
        highlighted && styles.highlightedStat,
        highlighted && { backgroundColor: THEME.surfaceContainerHigh },
      ]}
    >
      <Text variant="labelMedium" style={{ color: THEME.onSurfaceVariant }}>
        {t(label)}
      </Text>
      <Text variant="titleLarge" style={color ? { color } : undefined}>
        {formatPrivateLocalizedAmount(
          value,
          currencyCode,
          locale,
          areAmountsVisible,
        )}
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
  const { locale, t } = useTranslation();
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
                  {formatPrivateLocalizedAmount(
                    overview.spentAmount,
                    overview.budget.currency_code,
                    locale,
                    areAmountsVisible,
                  )}
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
                {formatPrivateLocalizedAmount(
                  logic.selectedCategory.spent_amount,
                  overview.budget.currency_code,
                  locale,
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
  budgetAmount: { fontWeight: "700", marginRight: 12, marginTop: 2 },
  budgetLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  currencyButton: { margin: 0, padding: 4 },
  currencyCard: {
    alignSelf: "center",
    borderRadius: 16,
    flexShrink: 0,
    overflow: "hidden",
    paddingHorizontal: 2,
    paddingVertical: 3,
  },
  currencyCode: { fontWeight: "700", lineHeight: 20 },
  currencyLabel: { alignItems: "center", minWidth: 44 },
  currencyNavigator: {
    alignItems: "center",
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
  },
  emptyButton: { borderRadius: 8, marginTop: 20, width: "100%" },
  emptyCurrencyRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  emptyIconContainer: { alignItems: "flex-end", flex: 1, paddingRight: 12 },
  emptyCard: {
    alignItems: "center",
    borderRadius: 16,
    margin: 12,
    paddingHorizontal: 28,
    paddingTop: 4,
    paddingBottom: 12,
  },
  emptyText: { marginTop: 8, textAlign: "center" },
  emptyTitle: { marginTop: 16 },
  errorCurrencySelector: { marginBottom: 24, marginTop: 18 },
  errorIconContainer: {
    alignItems: "center",
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  errorText: { marginTop: 8, maxWidth: 320, textAlign: "center" },
  errorTitle: { marginTop: 16, textAlign: "center" },
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
  highlightedStat: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  overallProgress: { borderRadius: 5, height: 10, marginTop: 6 },
  overviewCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    height: BUDGET_SWIPE_CARD_HEIGHT,
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 20,
    paddingTop: 10,
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
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 12,
    marginBottom: 8,
    marginTop: 20,
  },
  stat: { flex: 1 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
});
