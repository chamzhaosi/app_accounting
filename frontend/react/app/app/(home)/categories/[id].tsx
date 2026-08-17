import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";
import AppDateRangePicker, {
  AppDateRangeValue,
} from "../../../components/AppDateRangePicker";
import AppFloatingButton from "../../../components/AppFloatingButton";
import AppIcon, { AppIconProps } from "../../../components/AppIcon";
import AppView from "../../../components/AppView";
import { TXN_TYPE_ENUM } from "../../../constants/enum";
import {
  categoryManagementQueryKeys,
  transactionManagementQueryKeys,
} from "../../../constants/queryKeys";
import { TRANSACTION_MANAGEMENT_CREATE_URL } from "../../../constants/urls";
import { getCategoryMgmtById } from "../../../sql/service/categoryMgmtService";
import { getCategoryDateRangeSummary } from "../../../sql/service/transactionMgmtService";
import { useThemeStore } from "../../../stores/useThemeStore";
import { DEBUG_TAG } from "../../../utils/debugLog";
import TransactionManagementList from "../../transaction_management/list";
import {
  formatDateValue,
  getCurrentMonthDateRange,
  parseDateValue,
} from "../../../utils/date";
import { formatAmount } from "../../../utils/number";

const getInitialDateRange = (
  startDate?: string,
  endDate?: string,
): AppDateRangeValue => {
  const parsedStartDate = parseDateValue(startDate);
  const parsedEndDate = parseDateValue(endDate);

  if (parsedStartDate && parsedEndDate) {
    return { startDate: parsedStartDate, endDate: parsedEndDate };
  }

  return getCurrentMonthDateRange();
};

export default function CategoryDetail() {
  const {
    id,
    startDate: initialStartDate,
    endDate: initialEndDate,
  } = useLocalSearchParams<{
    id: string;
    startDate?: string;
    endDate?: string;
  }>();
  const { THEME } = useThemeStore();
  const [dateRange, setDateRange] = useState<AppDateRangeValue>(() =>
    getInitialDateRange(initialStartDate, initialEndDate),
  );
  const startDate = formatDateValue(dateRange.startDate);
  const endDate = formatDateValue(dateRange.endDate);

  const categoryQuery = useQuery({
    queryKey: categoryManagementQueryKeys.detail(id),
    queryFn: () => getCategoryMgmtById(id),
    enabled: Boolean(id),
  });
  const summaryQuery = useQuery({
    queryKey: transactionManagementQueryKeys.categoryDateRangeSummary({
      categoryId: id,
      startDate,
      endDate,
    }),
    queryFn: () => getCategoryDateRangeSummary(id, startDate, endDate),
    enabled: Boolean(id && startDate && endDate),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (categoryQuery.error) {
      console.error(
        DEBUG_TAG.CATEGORY_MANAGEMENT,
        "Error when loading category detail page",
        categoryQuery.error,
      );
    }
  }, [categoryQuery.error]);

  useEffect(() => {
    if (summaryQuery.error) {
      console.error(
        DEBUG_TAG.TRANSACTION_MANAGEMENT,
        "Error when loading category period summary",
        summaryQuery.error,
      );
    }
  }, [summaryQuery.error]);

  if (categoryQuery.isLoading) {
    return (
      <View className="h-full items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const category = categoryQuery.data;
  const transactionType =
    category?.type_id === 1 ? TXN_TYPE_ENUM.INCOME : TXN_TYPE_ENUM.EXPENSE;
  const typeLabel = category?.type_id === 1 ? "Income" : "Expense";

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
      <Surface
        elevation={1}
        style={[
          styles.summary,
          { backgroundColor: THEME.surfaceContainerHigh },
        ]}
      >
        <View style={styles.categoryHeading}>
          {category && (
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: THEME.surfaceContainerHighest },
              ]}
            >
              <AppIcon name={category.icon as AppIconProps["name"]} size={24} />
            </View>
          )}
          <View style={styles.categoryName}>
            <Text variant="titleLarge" numberOfLines={1}>
              {category?.label ?? "Category unavailable"}
            </Text>
            {category && (
              <Text
                variant="bodyMedium"
                style={{ color: THEME.onSurfaceVariant }}
              >
                {typeLabel}
              </Text>
            )}
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
          <View style={styles.summaryItem}>
            <Text style={{ color: THEME.onSurfaceVariant }}>Period Total</Text>
            <Text
              style={[
                styles.summaryAmount,
                {
                  color: category?.type_id === 1 ? THEME.primary : THEME.error,
                },
              ]}
            >
              {formatAmount(summaryQuery.data?.total_amount ?? 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={{ color: THEME.onSurfaceVariant }}>Transactions</Text>
            <Text style={styles.summaryAmount}>
              {summaryQuery.data?.transaction_count ?? 0}
            </Text>
          </View>
        </View>
      </Surface>

      {category && (
        <TransactionManagementList
          startDate={startDate}
          endDate={endDate}
          categoryId={id}
        />
      )}

      {category && (
        <AppFloatingButton
          icon="plus"
          accessibilityLabel={`Add transaction for ${category.label}`}
          onPress={() =>
            router.push({
              pathname: TRANSACTION_MANAGEMENT_CREATE_URL,
              params: {
                categoryId: id,
                transactionType,
              },
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
  categoryHeading: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  categoryIcon: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    marginRight: 12,
    width: 44,
  },
  categoryName: {
    flex: 1,
  },
  summaryRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
});
