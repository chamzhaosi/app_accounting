import { router } from "expo-router";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppView from "../../components/AppView";
import { TRANSACTION_MANAGEMENT_CREATE_URL } from "../../constants/urls";
import useDashboard from "../../hook/dashboard/useDashboard";
import TransactionManagementList from "../transaction_management/list";
import DashboardSummaryCarousel from "./_components/DashboardSummaryCarousel";

export default function Dashboard() {
  const { dateRange, endDate, onDateRangeChange, startDate } = useDashboard();

  return (
    <AppView
      isSafe
      edges={["top"]}
      className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow"
    >
      <DashboardSummaryCarousel
        dateRange={dateRange}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={onDateRangeChange}
      />
      <TransactionManagementList startDate={startDate} endDate={endDate} />

      <AppFloatingButton
        icon="plus"
        onPress={() => router.push(TRANSACTION_MANAGEMENT_CREATE_URL)}
      />
    </AppView>
  );
}
