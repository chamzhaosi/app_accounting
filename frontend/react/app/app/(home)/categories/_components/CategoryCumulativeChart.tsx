import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import CumulativeLineChartCard, {
  CumulativeChartPoint,
} from "../../../../components/CumulativeLineChartCard";
import { transactionManagementQueryKeys } from "../../../../constants/queryKeys";
import { CATEGORY_DETAIL_CARD_HEIGHT } from "../../../../constants/size";
import { getCategoryDailyTotals } from "../../../../sql/service/transactionMgmtService";
import { useThemeStore } from "../../../../stores/useThemeStore";
import { DEBUG_TAG } from "../../../../utils/debugLog";

type CategoryCumulativeChartProps = {
  categoryId: string;
  typeId: number;
  startDate: string;
  endDate: string;
};

export default function CategoryCumulativeChart({
  categoryId,
  typeId,
  startDate,
  endDate,
}: CategoryCumulativeChartProps) {
  const { THEME } = useThemeStore();
  const query = useQuery({
    queryKey: transactionManagementQueryKeys.categoryDailyTotal({
      categoryId,
      startDate,
      endDate,
    }),
    queryFn: () => getCategoryDailyTotals(categoryId, startDate, endDate),
    enabled: Boolean(categoryId && startDate && endDate),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (!query.error) return;
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Error when loading category cumulative totals",
      query.error,
    );
  }, [query.error]);

  const data = useMemo<CumulativeChartPoint[]>(() => {
    const totalsByDate = new Map(
      query.data?.map((item) => [item.transaction_date, item.daily_total]),
    );
    const days = Math.max(dayjs(endDate).diff(dayjs(startDate), "day") + 1, 1);
    const labelInterval = Math.max(Math.ceil(days / 6), 1);
    let total = 0;

    return Array.from({ length: days }, (_, index) => {
      const date = dayjs(startDate).add(index, "day");
      total += totalsByDate.get(date.format("YYYY-MM-DD")) ?? 0;
      return {
        value: total,
        label:
          index % labelInterval === 0 || index === days - 1
            ? date.format("D/M")
            : "",
        date: date.format("D MMM YYYY"),
      };
    });
  }, [endDate, query.data, startDate]);

  const isIncome = typeId === 1;
  return (
    <CumulativeLineChartCard
      title={`Cumulative ${isIncome ? "income" : "expense"}`}
      seriesLabel={isIncome ? "Income" : "Expense"}
      data={data}
      color={isIncome ? THEME.primary : THEME.error}
      cardHeight={CATEGORY_DETAIL_CARD_HEIGHT}
      isLoading={query.isLoading}
    />
  );
}
