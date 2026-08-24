import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import type { CumulativeChartPoint } from "../../components/CumulativeLineChartCard";
import { transactionManagementQueryKeys } from "../../constants/queryKeys";
import { getAccountDailyBalanceChanges } from "../../sql/service/transactionMgmtService";
import { addAmounts } from "../../utils/amount";
import { formatLocalizedDateLabel } from "../../utils/date";
import { DEBUG_TAG } from "../../utils/debugLog";
import { useTranslation } from "../../i18n/helper";

type UseAccountBalanceHistoryChartParams = {
  accountId: string;
  startDate: string;
  endDate: string;
  forwardBalance: number;
};

export default function useAccountBalanceHistoryChart({
  accountId,
  startDate,
  endDate,
  forwardBalance,
}: UseAccountBalanceHistoryChartParams) {
  const { locale } = useTranslation();
  const query = useQuery({
    queryKey: transactionManagementQueryKeys.accountDailyBalance({
      accountId,
      startDate,
      endDate,
    }),
    queryFn: () => getAccountDailyBalanceChanges(accountId, startDate, endDate),
    enabled: Boolean(accountId && startDate && endDate),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (!query.error) return;
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Error when loading account balance history",
      query.error,
    );
  }, [query.error]);

  const data = useMemo<CumulativeChartPoint[]>(() => {
    const changesByDate = new Map(
      query.data?.map((item) => [item.transaction_date, item.balance_change]),
    );
    const days = Math.max(dayjs(endDate).diff(dayjs(startDate), "day") + 1, 1);
    const labelInterval = Math.max(Math.ceil(days / 6), 1);
    let balance = forwardBalance;

    return Array.from({ length: days }, (_, index) => {
      const date = dayjs(startDate).add(index, "day");
      balance = addAmounts(
        balance,
        changesByDate.get(date.format("YYYY-MM-DD")) ?? 0,
      );
      return {
        value: balance,
        label:
          index % labelInterval === 0 || index === days - 1
            ? date.format("D/M")
            : "",
        date: formatLocalizedDateLabel(date.toDate(), locale),
      };
    });
  }, [endDate, forwardBalance, locale, query.data, startDate]);

  return { data, isLoading: query.isLoading };
}
