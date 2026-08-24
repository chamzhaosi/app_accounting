import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Route } from "react-native-tab-view";
import type { AppDateRangeValue } from "../../components/AppDateRangePicker";
import { categoryManagementQueryKeys } from "../../constants/queryKeys";
import { DEFAULT_PAGE_SIZE } from "../../constants/size";
import { getCategoryPeriodSummaryList } from "../../sql/service/categoryMgmtService";
import { formatDateValue, getCurrentMonthDateRange } from "../../utils/date";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

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
  const [index, setIndex] = useState(0);
  const [dateRange, setDateRange] = useState<AppDateRangeValue>(
    getCurrentMonthDateRange,
  );

  return {
    dateRange,
    endDate: formatDateValue(dateRange.endDate),
    index,
    routes: CATEGORY_HOME_TAB_ROUTES,
    setDateRange,
    setIndex,
    startDate: formatDateValue(dateRange.startDate),
  };
}

export const useCategoryPeriodList = (
  typeId: number,
  startDate: string,
  endDate: string,
) => {
  const query = useInfiniteQuery({
    queryKey: categoryManagementQueryKeys.periodList({
      typeId,
      pageSize: DEFAULT_PAGE_SIZE,
      startDate,
      endDate,
    }),
    queryFn: ({ pageParam }) =>
      getCategoryPeriodSummaryList(
        typeId,
        startDate,
        endDate,
        pageParam,
        DEFAULT_PAGE_SIZE,
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
  }, [endDate, query.error, startDate, typeId]);

  const onLoadMore = () => {
    if (query.isFetchingNextPage || !query.hasNextPage) return;
    debugLog(
      DEBUG_TAG.CATEGORY_MANAGEMENT,
      "Fetching next category period page",
      { typeId, startDate, endDate },
    );
    void query.fetchNextPage();
  };

  const onRefresh = async () => {
    debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT, "Refreshing category period list", {
      typeId,
      startDate,
      endDate,
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
