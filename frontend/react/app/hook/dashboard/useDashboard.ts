import { useState } from "react";
import type { AppDateRangeValue } from "../../components/AppDateRangePicker";
import { formatDateValue } from "../../utils/date";

const getDefaultDateRange = (): AppDateRangeValue => {
  const today = new Date();
  return {
    startDate: new Date(today.getFullYear(), today.getMonth(), 1),
    endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  };
};

export default function useDashboard() {
  const [dateRange, setDateRange] =
    useState<AppDateRangeValue>(getDefaultDateRange);

  return {
    dateRange,
    endDate: formatDateValue(dateRange.endDate),
    onDateRangeChange: setDateRange,
    startDate: formatDateValue(dateRange.startDate),
  };
}
