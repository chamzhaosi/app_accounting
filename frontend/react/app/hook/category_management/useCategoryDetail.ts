import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import type { AppDateRangeValue } from "../../components/AppDateRangePicker";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import {
  categoryManagementQueryKeys,
  transactionManagementQueryKeys,
} from "../../constants/queryKeys";
import { getCategoryMgmtById } from "../../sql/service/categoryMgmtService";
import { getCategoryDateRangeSummary } from "../../sql/service/transactionMgmtService";
import {
  formatDateValue,
  getCurrentMonthDateRange,
  parseDateValue,
} from "../../utils/date";
import { DEBUG_TAG } from "../../utils/debugLog";

const getInitialDateRange = (
  startDate?: string,
  endDate?: string,
): AppDateRangeValue => {
  const parsedStartDate = parseDateValue(startDate);
  const parsedEndDate = parseDateValue(endDate);

  return parsedStartDate && parsedEndDate
    ? { startDate: parsedStartDate, endDate: parsedEndDate }
    : getCurrentMonthDateRange();
};

export default function useCategoryDetail() {
  const {
    id,
    startDate: initialStartDate,
    endDate: initialEndDate,
  } = useLocalSearchParams<{
    id: string;
    startDate?: string;
    endDate?: string;
  }>();
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
    if (!categoryQuery.error) return;
    console.error(
      DEBUG_TAG.CATEGORY_MANAGEMENT,
      "Error when loading category detail page",
      categoryQuery.error,
    );
  }, [categoryQuery.error]);

  useEffect(() => {
    if (!summaryQuery.error) return;
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Error when loading category period summary",
      summaryQuery.error,
    );
  }, [summaryQuery.error]);

  const category = categoryQuery.data;

  return {
    category,
    dateRange,
    endDate,
    id,
    isLoading: categoryQuery.isLoading,
    periodTotal: summaryQuery.data?.total_amount ?? 0,
    setDateRange,
    startDate,
    transactionCount: summaryQuery.data?.transaction_count ?? 0,
    transactionType:
      category?.type_id === 1 ? TXN_TYPE_ENUM.INCOME : TXN_TYPE_ENUM.EXPENSE,
    typeLabel: category?.type_id === 1 ? "Income" : "Expense",
  };
}
