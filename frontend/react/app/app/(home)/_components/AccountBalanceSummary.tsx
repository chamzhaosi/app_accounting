import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";
import AppDateRangePicker, {
  AppDateRangeValue,
} from "../../../components/AppDateRangePicker";
import { BUDGET_REMAINING_COLOR } from "../../../constants/colors";
import { DASHBOARD_SUMMARY_CARD_HEIGHT } from "../../../constants/size";
import useAccountBalanceSummary from "../../../hook/dashboard/useAccountBalanceSummary";
import { useThemeStore } from "../../../stores/useThemeStore";
import { formatAmount } from "../../../utils/number";

type AccountBalanceSummaryProps = {
  dateRange: AppDateRangeValue;
  startDate: string;
  endDate: string;
  onDateRangeChange: (range: AppDateRangeValue) => void;
};

export default function AccountBalanceSummary({
  dateRange,
  startDate,
  endDate,
  onDateRangeChange,
}: AccountBalanceSummaryProps) {
  const { isDark, THEME } = useThemeStore();
  const {
    balance,
    expense,
    income,
    isBalanceLoading,
    isBudgetLoading,
    isBudgetOver,
    remainingBudget,
  } = useAccountBalanceSummary(startDate, endDate);
  const remainingBudgetColor = isBudgetOver
    ? THEME.error
    : isDark
      ? BUDGET_REMAINING_COLOR.dark
      : BUDGET_REMAINING_COLOR.light;

  return (
    <Surface
      elevation={1}
      style={[
        styles.container,
        { backgroundColor: THEME.surfaceContainerHigh },
      ]}
    >
      <View
        style={[
          styles.dateRangeContainer,
          { borderBottomColor: THEME.outlineVariant },
        ]}
      >
        <AppDateRangePicker
          label="Date Range"
          maxRangeDays={90}
          value={dateRange}
          onChange={onDateRangeChange}
        />
      </View>

      <View style={styles.balanceContainer}>
        <Text variant="labelLarge" style={{ color: THEME.onSurfaceVariant }}>
          Balance
        </Text>
        {isBalanceLoading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <Text
            variant="headlineLarge"
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            numberOfLines={1}
            style={styles.balanceAmount}
          >
            {formatAmount(balance)}
          </Text>
        )}

        <View style={styles.cashFlowRow}>
          <View style={styles.cashFlowItem}>
            <Text
              variant="labelSmall"
              style={{ color: THEME.onSurfaceVariant }}
            >
              Expense
            </Text>
            <Text
              variant="titleMedium"
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              numberOfLines={1}
              style={[styles.cashFlowAmount, { color: THEME.error }]}
            >
              {formatAmount(expense)}
            </Text>
          </View>

          <View
            style={[
              styles.cashFlowDivider,
              { backgroundColor: THEME.outlineVariant },
            ]}
          />

          <View style={styles.cashFlowItem}>
            <Text
              variant="labelSmall"
              style={{ color: THEME.onSurfaceVariant }}
            >
              Income
            </Text>
            <Text
              variant="titleMedium"
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              numberOfLines={1}
              style={[styles.cashFlowAmount, { color: THEME.primary }]}
            >
              {formatAmount(income)}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.budgetContainer,
          { borderTopColor: THEME.outlineVariant },
        ]}
      >
        <Text variant="labelMedium" style={{ color: THEME.onSurfaceVariant }}>
          {isBudgetOver ? "Budget Over" : "Budget Left"}
        </Text>
        {isBudgetLoading ? (
          <ActivityIndicator size="small" style={styles.budgetLoader} />
        ) : (
          <Text
            variant="titleMedium"
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            numberOfLines={1}
            style={[styles.budgetAmount, { color: remainingBudgetColor }]}
          >
            {formatAmount(remainingBudget)}
          </Text>
        )}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    height: DASHBOARD_SUMMARY_CARD_HEIGHT,
    marginHorizontal: 12,
    marginVertical: 8,
    overflow: "hidden",
  },
  dateRangeContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  balanceContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 90,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  balanceAmount: {
    fontWeight: "700",
    marginTop: 4,
    maxWidth: "100%",
  },
  cashFlowRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    maxWidth: 340,
    width: "100%",
  },
  cashFlowItem: {
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  cashFlowAmount: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
    maxWidth: "100%",
  },
  cashFlowDivider: {
    height: 28,
    width: StyleSheet.hairlineWidth,
  },
  loader: {
    marginTop: 16,
  },
  budgetContainer: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  budgetAmount: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
  },
  budgetLoader: {
    marginLeft: 8,
  },
});
