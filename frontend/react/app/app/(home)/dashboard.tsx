import { router } from "expo-router";
import { useState } from "react";
import AppFloatingButton from "../../components/AppFloatingButton";
import { AppDateRangeValue } from "../../components/AppDateRangePicker";
import AppView from "../../components/AppView";
import { TRANSACTION_MANAGEMENT_CREATE_URL } from "../../constants/urls";
import TransactionManagementList from "../transaction_management/list";
import AccountBalanceSummary from "./_components/AccountBalanceSummary";
import { formatDateValue } from "../../utils/date";

const getDefaultDateRange = (): AppDateRangeValue => {
  const today = new Date();
  return {
    startDate: new Date(today.getFullYear(), today.getMonth(), 1),
    endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  };
};

export default function Dashboard() {
  const [dateRange, setDateRange] =
    useState<AppDateRangeValue>(getDefaultDateRange);
  const startDate = formatDateValue(dateRange.startDate);
  const endDate = formatDateValue(dateRange.endDate);

  return (
    <AppView
      isSafe
      edges={["top"]}
      className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow"
    >
      <AccountBalanceSummary
        dateRange={dateRange}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={setDateRange}
      />
      <TransactionManagementList startDate={startDate} endDate={endDate} />

      <AppFloatingButton
        icon="plus"
        onPress={() => router.push(TRANSACTION_MANAGEMENT_CREATE_URL)}
      />
    </AppView>
  );
}
