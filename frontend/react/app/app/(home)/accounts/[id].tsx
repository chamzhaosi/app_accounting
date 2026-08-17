import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";
import AppDateRangePicker, {
  AppDateRangeValue,
} from "../../../components/AppDateRangePicker";
import AppFloatingButton from "../../../components/AppFloatingButton";
import AppView from "../../../components/AppView";
import {
  accountManagementQueryKeys,
  transactionManagementQueryKeys,
} from "../../../constants/queryKeys";
import { TRANSACTION_MANAGEMENT_CREATE_URL } from "../../../constants/urls";
import { getAccMgmtById } from "../../../sql/service/accMgmtService";
import {
  getAccountDateRangeFlowTotals,
  getAccountForwardBalance,
} from "../../../sql/service/transactionMgmtService";
import { useThemeStore } from "../../../stores/useThemeStore";
import { DEBUG_TAG } from "../../../utils/debugLog";
import TransactionManagementList from "../../transaction_management/list";

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDate = (date?: Date) => {
  if (!date || Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCurrentMonth = (): AppDateRangeValue => {
  const today = new Date();
  return {
    startDate: new Date(today.getFullYear(), today.getMonth(), 1),
    endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0),
  };
};

export default function AccountDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { THEME } = useThemeStore();
  const [dateRange, setDateRange] =
    useState<AppDateRangeValue>(getCurrentMonth);
  const startDate = formatDate(dateRange.startDate);
  const endDate = formatDate(dateRange.endDate);

  const accountQuery = useQuery({
    queryKey: accountManagementQueryKeys.detail(id),
    queryFn: () => getAccMgmtById(id),
    enabled: Boolean(id),
  });
  const flowTotalsQuery = useQuery({
    queryKey: transactionManagementQueryKeys.accountFlowTotals({
      accountId: id,
      startDate,
      endDate,
    }),
    queryFn: () => getAccountDateRangeFlowTotals(id, startDate, endDate),
    enabled: Boolean(id && startDate && endDate),
    placeholderData: (previousData) => previousData,
  });
  const forwardBalanceQuery = useQuery({
    queryKey: transactionManagementQueryKeys.accountForwardBalance({
      accountId: id,
      startDate,
    }),
    queryFn: () => getAccountForwardBalance(id, startDate),
    enabled: Boolean(id && startDate),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (accountQuery.error) {
      console.error(
        DEBUG_TAG.ACCOUNT_MANAGEMENT,
        "Error when loading account detail page",
        accountQuery.error,
      );
    }
  }, [accountQuery.error]);

  useEffect(() => {
    if (flowTotalsQuery.error) {
      console.error(
        DEBUG_TAG.TRANSACTION_MANAGEMENT,
        "Error when loading account flow totals",
        flowTotalsQuery.error,
      );
    }
  }, [flowTotalsQuery.error]);

  useEffect(() => {
    if (forwardBalanceQuery.error) {
      console.error(
        DEBUG_TAG.TRANSACTION_MANAGEMENT,
        "Error when loading account forward balance",
        forwardBalanceQuery.error,
      );
    }
  }, [forwardBalanceQuery.error]);

  if (accountQuery.isLoading) {
    return (
      <View className="h-full items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const account = accountQuery.data;
  const moneyIn = flowTotalsQuery.data?.in_total ?? 0;
  const moneyOut = flowTotalsQuery.data?.out_total ?? 0;
  const forwardBalance = forwardBalanceQuery.data ?? 0;
  const periodEndBalance = forwardBalance - moneyOut + moneyIn;

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
      <Surface
        elevation={1}
        style={[
          styles.summary,
          { backgroundColor: THEME.surfaceContainerHigh },
        ]}
      >
        <View style={styles.accountHeading}>
          <View style={styles.accountName}>
            <Text variant="titleLarge" numberOfLines={1}>
              {account?.label ?? "Account unavailable"}
            </Text>
            {account && (
              <Text
                variant="bodyMedium"
                style={{ color: THEME.onSurfaceVariant }}
              >
                {account.type_label}
              </Text>
            )}
          </View>
          <View style={styles.balance}>
            <Text
              variant="labelMedium"
              style={{ color: THEME.onSurfaceVariant }}
            >
              Current Balance
            </Text>
            <Text variant="titleLarge" style={styles.balanceAmount}>
              {amountFormatter.format(account?.current_balance ?? 0)}
            </Text>
          </View>
        </View>

        <AppDateRangePicker
          label="Date Range"
          maxRangeDays={90}
          value={dateRange}
          onChange={setDateRange}
        />

        <View
          style={[styles.summaryRow, { borderTopColor: THEME.outlineVariant }]}
        >
          <View style={styles.periodTotal}>
            <Text style={{ color: THEME.onSurfaceVariant }}>
              Balance Forward
            </Text>
            <Text style={styles.periodAmount}>
              {amountFormatter.format(forwardBalance)}
            </Text>
          </View>
          <View style={styles.periodTotal}>
            <Text style={{ color: THEME.onSurfaceVariant }}>
              Period End Balance
            </Text>
            <Text style={styles.periodAmount}>
              {amountFormatter.format(periodEndBalance)}
            </Text>
          </View>
        </View>

        <View
          style={[styles.summaryRow, { borderTopColor: THEME.outlineVariant }]}
        >
          <View style={styles.periodTotal}>
            <Text style={{ color: THEME.onSurfaceVariant }}>Money Out</Text>
            <Text style={[styles.periodAmount, { color: THEME.error }]}>
              {amountFormatter.format(moneyOut)}
            </Text>
          </View>
          <View style={styles.periodTotal}>
            <Text style={{ color: THEME.onSurfaceVariant }}>Money In</Text>
            <Text style={[styles.periodAmount, { color: THEME.primary }]}>
              {amountFormatter.format(moneyIn)}
            </Text>
          </View>
        </View>
      </Surface>

      {account && (
        <TransactionManagementList
          startDate={startDate}
          endDate={endDate}
          accountId={id}
        />
      )}

      {account && (
        <AppFloatingButton
          icon="plus"
          accessibilityLabel={`Add transaction for ${account.label}`}
          onPress={() =>
            router.push({
              pathname: TRANSACTION_MANAGEMENT_CREATE_URL,
              params: { accountId: id },
            })
          }
        />
      )}
    </AppView>
  );
}

const styles = StyleSheet.create({
  summary: {
    borderRadius: 20,
    margin: 12,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  accountHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  accountName: {
    flex: 1,
    marginRight: 16,
  },
  balance: {
    alignItems: "flex-end",
  },
  balanceAmount: {
    fontWeight: "700",
    marginTop: 2,
  },
  summaryRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  periodTotal: {
    alignItems: "center",
    flex: 1,
  },
  periodAmount: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
});
