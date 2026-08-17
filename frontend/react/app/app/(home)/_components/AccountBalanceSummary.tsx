import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";
import AppDateRangePicker, {
  AppDateRangeValue,
} from "../../../components/AppDateRangePicker";
import {
  accountManagementQueryKeys,
  transactionManagementQueryKeys,
} from "../../../constants/queryKeys";
import { getMainAccountBalance } from "../../../sql/service/accMgmtService";
import { getTransactionDateRangeTotals } from "../../../sql/service/transactionMgmtService";
import { useThemeStore } from "../../../stores/useThemeStore";
import { DEBUG_TAG } from "../../../utils/debugLog";

const formatAmount = (amount: number) => amount.toFixed(2);

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
  const { THEME } = useThemeStore();
  const balanceQuery = useQuery({
    queryKey: accountManagementQueryKeys.mainBalance(),
    queryFn: getMainAccountBalance,
  });
  const totalsQuery = useQuery({
    queryKey: transactionManagementQueryKeys.dateRangeTotals({
      startDate,
      endDate,
    }),
    queryFn: () => getTransactionDateRangeTotals(startDate, endDate),
    enabled: Boolean(startDate && endDate),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (!balanceQuery.error) return;

    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when loading main account balance",
      balanceQuery.error,
    );
  }, [balanceQuery.error]);

  useEffect(() => {
    if (!totalsQuery.error) return;

    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Error when loading transaction date range totals",
      totalsQuery.error,
    );
  }, [totalsQuery.error]);

  const balance = balanceQuery.data ?? 0;
  const income = totalsQuery.data?.income_total ?? 0;
  const expense = totalsQuery.data?.expense_total ?? 0;

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
        {balanceQuery.isLoading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <Text variant="headlineLarge" style={styles.balanceAmount}>
            {formatAmount(balance)}
          </Text>
        )}
      </View>

      <View
        style={[
          styles.totalsContainer,
          { borderTopColor: THEME.outlineVariant },
        ]}
      >
        <View style={styles.totalItem}>
          <Text variant="labelMedium" style={{ color: THEME.onSurfaceVariant }}>
            Expense
          </Text>
          <Text
            variant="titleMedium"
            style={[styles.totalAmount, { color: THEME.error }]}
          >
            {formatAmount(expense)}
          </Text>
        </View>
        <View style={styles.totalItem}>
          <Text variant="labelMedium" style={{ color: THEME.onSurfaceVariant }}>
            Income
          </Text>
          <Text
            variant="titleMedium"
            style={[styles.totalAmount, { color: THEME.primary }]}
          >
            {formatAmount(income)}
          </Text>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    margin: 12,
    overflow: "hidden",
  },
  dateRangeContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  balanceContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    padding: 20,
  },
  balanceAmount: {
    fontWeight: "700",
    marginTop: 8,
  },
  loader: {
    marginTop: 16,
  },
  totalsContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  totalItem: {
    alignItems: "center",
    flex: 1,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
});
