import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import type { CumulativeChartPoint } from "../../components/CumulativeLineChartCard";
import { transactionManagementQueryKeys } from "../../constants/queryKeys";
import { getCategoryDailyTotals } from "../../sql/service/transactionMgmtService";
import { addAmounts } from "../../utils/amount";
import { formatLocalizedDateLabel } from "../../utils/date";
import { DEBUG_TAG } from "../../utils/debugLog";
import { useTranslation } from "../../i18n/helper";

type UseCategoryCumulativeChartParams = {
  categoryId: string;
  startDate: string;
  endDate: string;
};

export default function useCategoryCumulativeChart({
  categoryId,
  startDate,
  endDate,
}: UseCategoryCumulativeChartParams) {
  const { locale } = useTranslation();
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
      total = addAmounts(
        total,
        totalsByDate.get(date.format("YYYY-MM-DD")) ?? 0,
      );
      return {
        value: total,
        label:
          index % labelInterval === 0 || index === days - 1
            ? date.format("D/M")
            : "",
        date: formatLocalizedDateLabel(date.toDate(), locale),
      };
    });
  }, [endDate, locale, query.data, startDate]);

  return { data, isLoading: query.isLoading };
}
