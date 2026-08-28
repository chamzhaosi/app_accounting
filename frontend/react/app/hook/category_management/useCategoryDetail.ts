import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import type { SelectOptionType } from "../../components/AppSelect";
import type { AppDateRangeValue } from "../../components/AppDateRangePicker";
import { ALL_CURRENCIES_VALUE } from "../../constants/currencies";
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
import { compareAmounts } from "../../utils/amount";
import { useTranslation } from "../../i18n/helper";
import useCurrencyPreferenceOptions from "../currency_management/useCurrencyPreferenceOptions";

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
    currencyCode: initialCurrencyCode,
  } = useLocalSearchParams<{
    id: string;
    startDate?: string;
    endDate?: string;
    currencyCode?: string;
  }>();
  const { t } = useTranslation();
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(
    initialCurrencyCode ?? ALL_CURRENCIES_VALUE,
  );
  const [isCurrencyTotalsVisible, setIsCurrencyTotalsVisible] = useState(false);
  const { enabledCurrencyCodes } =
    useCurrencyPreferenceOptions(initialCurrencyCode);
  const currencyOptions = useMemo<SelectOptionType[]>(
    () => [
      {
        id: ALL_CURRENCIES_VALUE,
        label: t("All"),
        value: ALL_CURRENCIES_VALUE,
      },
      ...enabledCurrencyCodes.map((code) => ({
        id: code,
        label: code,
        value: code,
      })),
    ],
    [enabledCurrencyCodes, t],
  );
  const currencyCode =
    selectedCurrencyCode === ALL_CURRENCIES_VALUE
      ? undefined
      : selectedCurrencyCode;
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
      currencyCode,
    }),
    queryFn: () =>
      getCategoryDateRangeSummary(id, startDate, endDate, currencyCode),
    enabled: Boolean(id && startDate && endDate),
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
  const currencyOrder = new Map(
    enabledCurrencyCodes.map((code, index) => [code, index]),
  );
  const currencyTotals = [...(summaryQuery.data ?? [])].sort(
    (left, right) =>
      (currencyOrder.get(left.currency_code) ?? Number.MAX_SAFE_INTEGER) -
        (currencyOrder.get(right.currency_code) ?? Number.MAX_SAFE_INTEGER) ||
      left.currency_code.localeCompare(right.currency_code),
  );
  const currencyTotalPreview = [...currencyTotals]
    .sort(
      (left, right) =>
        compareAmounts(right.total_amount, left.total_amount) ||
        left.currency_code.localeCompare(right.currency_code),
    )
    .slice(0, 2);

  return {
    category,
    currencyCode,
    currencyOptions,
    currencyCodes: enabledCurrencyCodes,
    currencyTotalPreview,
    currencyTotals,
    dateRange,
    endDate,
    id,
    isLoading: categoryQuery.isLoading,
    isCurrencyTotalsVisible,
    hiddenCurrencyTotalCount:
      currencyTotals.length - currencyTotalPreview.length,
    onCloseCurrencyTotals: () => setIsCurrencyTotalsVisible(false),
    onOpenCurrencyTotals: () => setIsCurrencyTotalsVisible(true),
    periodTotal: currencyTotals[0]?.total_amount ?? 0,
    selectedCurrencyCode,
    setSelectedCurrencyCode,
    setDateRange,
    startDate,
    transactionCount: currencyTotals.reduce(
      (total, summary) => total + summary.transaction_count,
      0,
    ),
    transactionType:
      category?.type_id === 1 ? TXN_TYPE_ENUM.INCOME : TXN_TYPE_ENUM.EXPENSE,
    typeLabel: category?.type_id === 1 ? "Income" : "Expense",
  };
}
