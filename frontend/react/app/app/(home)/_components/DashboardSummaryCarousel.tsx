import { AppDateRangeValue } from "../../../components/AppDateRangePicker";
import AppSwipePager from "../../../components/AppSwipePager";
import AccountBalanceSummary from "./AccountBalanceSummary";
import DailyTransactionChart from "./DailyTransactionChart";

type DashboardSummaryCarouselProps = {
  dateRange: AppDateRangeValue;
  startDate: string;
  endDate: string;
  onDateRangeChange: (range: AppDateRangeValue) => void;
};

export default function DashboardSummaryCarousel({
  dateRange,
  startDate,
  endDate,
  onDateRangeChange,
}: DashboardSummaryCarouselProps) {
  return (
    <AppSwipePager>
      <AccountBalanceSummary
        dateRange={dateRange}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={onDateRangeChange}
      />
      <DailyTransactionChart startDate={startDate} endDate={endDate} />
    </AppSwipePager>
  );
}
