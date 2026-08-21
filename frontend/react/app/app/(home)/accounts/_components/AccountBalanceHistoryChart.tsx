import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import CumulativeLineChartCard, {
  CumulativeChartPoint,
} from "../../../../components/CumulativeLineChartCard";
import { transactionManagementQueryKeys } from "../../../../constants/queryKeys";
import { ACCOUNT_DETAIL_CARD_HEIGHT } from "../../../../constants/size";
import { getAccountDailyBalanceChanges } from "../../../../sql/service/transactionMgmtService";
import { useThemeStore } from "../../../../stores/useThemeStore";
import { DEBUG_TAG } from "../../../../utils/debugLog";

type AccountBalanceHistoryChartProps = {
  accountId: string;
  startDate: string;
  endDate: string;
  forwardBalance: number;
  isForwardBalanceLoading: boolean;
};

export default function AccountBalanceHistoryChart({
  accountId,
  startDate,
  endDate,
  forwardBalance,
  isForwardBalanceLoading,
}: AccountBalanceHistoryChartProps) {
  const { THEME } = useThemeStore();
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
      balance += changesByDate.get(date.format("YYYY-MM-DD")) ?? 0;
      return {
        value: balance,
        label:
          index % labelInterval === 0 || index === days - 1
            ? date.format("D/M")
            : "",
        date: date.format("D MMM YYYY"),
      };
    });
  }, [endDate, forwardBalance, query.data, startDate]);

  return (
    <CumulativeLineChartCard
      title="Balance trend"
      seriesLabel="End-of-day balance"
      data={data}
      color={THEME.primary}
      cardHeight={ACCOUNT_DETAIL_CARD_HEIGHT}
      isLoading={query.isLoading || isForwardBalanceLoading}
    />
  );
}
