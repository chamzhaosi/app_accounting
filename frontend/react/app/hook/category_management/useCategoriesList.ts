import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { Route } from "react-native-tab-view";
import type { SelectOptionType } from "../../components/AppSelect";
import type { AppDateRangeValue } from "../../components/AppDateRangePicker";
import { ALL_CURRENCIES_VALUE } from "../../constants/currencies";
import { categoryManagementQueryKeys } from "../../constants/queryKeys";
import { DEFAULT_PAGE_SIZE } from "../../constants/size";
import { getCategoryPeriodSummaryList } from "../../sql/service/categoryMgmtService";
import { formatDateValue, getCurrentMonthDateRange } from "../../utils/date";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { useTranslation } from "../../i18n/helper";
import { useReportingCurrencyStore } from "../../stores/useReportingCurrencyStore";
import usePeriodCurrencyCodes from "../transaction_management/usePeriodCurrencyCodes";

export type CategoryHomeTabRoute = Route & {
  key: "expense" | "income";
  title: string;
  typeId: number;
};

export const CATEGORY_HOME_TAB_ROUTES: CategoryHomeTabRoute[] = [
  { key: "expense", title: "Expense", typeId: 2 },
  { key: "income", title: "Income", typeId: 1 },
];

export default function useCategoriesList() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const selectedCurrencyCode = useReportingCurrencyStore(
    (state) => state.currencySelection,
  );
  const setCurrencySelection = useReportingCurrencyStore(
    (state) => state.setCurrencySelection,
  );
  const [dateRange, setDateRange] = useState<AppDateRangeValue>(
    getCurrentMonthDateRange,
  );
  const startDate = formatDateValue(dateRange.startDate);
  const endDate = formatDateValue(dateRange.endDate);
  const { currencyCodes: enabledCurrencyCodes } = usePeriodCurrencyCodes(
    startDate,
    endDate,
  );
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
      ...(selectedCurrencyCode !== ALL_CURRENCIES_VALUE &&
      !enabledCurrencyCodes.includes(selectedCurrencyCode)
        ? [
            {
              id: selectedCurrencyCode,
              label: selectedCurrencyCode,
              value: selectedCurrencyCode,
            },
          ]
        : []),
    ],
    [enabledCurrencyCodes, selectedCurrencyCode, t],
  );

  return {
    currencyCode:
      selectedCurrencyCode === ALL_CURRENCIES_VALUE
        ? undefined
        : selectedCurrencyCode,
    currencyCodes: enabledCurrencyCodes,
    currencyOptions,
    dateRange,
    endDate,
    index,
    routes: CATEGORY_HOME_TAB_ROUTES,
    setDateRange,
    setIndex,
    setSelectedCurrencyCode: (currencyCode: string) =>
      void setCurrencySelection(currencyCode),
    selectedCurrencyCode,
    startDate,
  };
}

export const useCategoryPeriodList = (
  typeId: number,
  startDate: string,
  endDate: string,
  currencyCode?: string,
) => {
  const query = useInfiniteQuery({
    queryKey: categoryManagementQueryKeys.periodList({
      typeId,
      pageSize: DEFAULT_PAGE_SIZE,
      startDate,
      endDate,
      currencyCode,
    }),
    queryFn: ({ pageParam }) =>
      getCategoryPeriodSummaryList(
        typeId,
        startDate,
        endDate,
        pageParam,
        DEFAULT_PAGE_SIZE,
        currencyCode,
      ),
    enabled: Boolean(startDate && endDate),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === DEFAULT_PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  useEffect(() => {
    if (!query.error) return;
    console.error(
      DEBUG_TAG.CATEGORY_MANAGEMENT,
      "Error when loading category period list",
      { typeId, startDate, endDate, error: query.error },
    );
  }, [currencyCode, endDate, query.error, startDate, typeId]);

  const onLoadMore = () => {
    if (query.isFetchingNextPage || !query.hasNextPage) return;
    debugLog(
      DEBUG_TAG.CATEGORY_MANAGEMENT,
      "Fetching next category period page",
      { typeId, startDate, endDate, currencyCode },
    );
    void query.fetchNextPage();
  };

  const onRefresh = async () => {
    debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT, "Refreshing category period list", {
      typeId,
      startDate,
      endDate,
      currencyCode,
    });
    await query.refetch();
  };

  return {
    categories: query.data?.pages.flat() ?? [],
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    onLoadMore,
    onRefresh,
  };
};
