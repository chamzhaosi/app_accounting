import CumulativeLineChartCard from "../../../../components/CumulativeLineChartCard";
import { ACCOUNT_DETAIL_CARD_HEIGHT } from "../../../../constants/size";
import useAccountBalanceHistoryChart from "../../../../hook/account_management/useAccountBalanceHistoryChart";
import { useThemeStore } from "../../../../stores/useThemeStore";

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
  const logic = useAccountBalanceHistoryChart({
    accountId,
    startDate,
    endDate,
    forwardBalance,
  });

  return (
    <CumulativeLineChartCard
      title="Balance trend"
      seriesLabel="End-of-day balance"
      data={logic.data}
      color={THEME.primary}
      cardHeight={ACCOUNT_DETAIL_CARD_HEIGHT}
      isLoading={logic.isLoading || isForwardBalanceLoading}
    />
  );
}
