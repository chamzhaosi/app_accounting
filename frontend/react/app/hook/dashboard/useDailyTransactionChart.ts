import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { transactionManagementQueryKeys } from "../../constants/queryKeys";
import { getTransactionDailyTotals } from "../../sql/service/transactionMgmtService";
import { addAmounts, prorateAmount } from "../../utils/amount";
import { DEBUG_TAG } from "../../utils/debugLog";
import useBudgetDailyRemaining from "./useBudgetDailyRemaining";
import { useTranslation } from "../../i18n/helper";
import { formatLocalizedDateLabel } from "../../utils/date";

export type ChartPoint = {
  value: number;
  label: string;
  date: string;
};

export type ChartMode = "daily" | "cumulative";

const getChartMaximum = (values: number[]) => {
  const maximum = Math.max(...values, 0);
  return Math.max(Math.ceil(maximum / 20) * 20, 20);
};

export default function useDailyTransactionChart(
  startDate: string,
  endDate: string,
) {
  const { locale } = useTranslation();
  const [mode, setMode] = useState<ChartMode>("daily");
  const isCumulative = mode === "cumulative";
  const queryStartDate = dayjs(startDate).startOf("month").format("YYYY-MM-DD");
  const dailyTotalsQuery = useQuery({
    queryKey: transactionManagementQueryKeys.dailyTotals({
      startDate: queryStartDate,
      endDate,
    }),
    queryFn: () => getTransactionDailyTotals(queryStartDate, endDate),
    enabled: Boolean(startDate && endDate),
    placeholderData: (previousData) => previousData,
  });
  const budgetQuery = useBudgetDailyRemaining(startDate, endDate);

  useEffect(() => {
    if (!dailyTotalsQuery.error) return;

    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Error when loading daily transaction totals",
      dailyTotalsQuery.error,
    );
  }, [dailyTotalsQuery.error]);

  const chartData = useMemo(() => {
    const totalsByDate = new Map(
      dailyTotalsQuery.data?.map((item) => [item.transaction_date, item]),
    );
    const budgetByDate = new Map(
      budgetQuery.data?.map((item) => [item.transaction_date, item]),
    );
    const cumulativeByDate = new Map<
      string,
      { income: number; expense: number }
    >();
    const queryDays = Math.max(
      dayjs(endDate).diff(dayjs(queryStartDate), "day") + 1,
      1,
    );
    let cumulativeMonth = "";
    let cumulativeIncome = 0;
    let cumulativeExpense = 0;

    for (let index = 0; index < queryDays; index += 1) {
      const date = dayjs(queryStartDate).add(index, "day");
      const dateKey = date.format("YYYY-MM-DD");
      const monthKey = date.format("YYYY-MM");
      if (monthKey !== cumulativeMonth) {
        cumulativeMonth = monthKey;
        cumulativeIncome = 0;
        cumulativeExpense = 0;
      }
      const totals = totalsByDate.get(dateKey);
      cumulativeIncome = addAmounts(
        cumulativeIncome,
        totals?.recorded_income_total ?? 0,
      );
      cumulativeExpense = addAmounts(
        cumulativeExpense,
        totals?.recorded_expense_total ?? 0,
      );
      cumulativeByDate.set(dateKey, {
        income: cumulativeIncome,
        expense: cumulativeExpense,
      });
    }

    const days = Math.max(dayjs(endDate).diff(dayjs(startDate), "day") + 1, 1);
    const labelInterval = Math.max(Math.ceil(days / 6), 1);
    const income: ChartPoint[] = [];
    const expense: ChartPoint[] = [];
    const cumulativeIncomeData: ChartPoint[] = [];
    const cumulativeExpenseData: ChartPoint[] = [];
    const budgetPace: ChartPoint[] = [];

    for (let index = 0; index < days; index += 1) {
      const date = dayjs(startDate).add(index, "day");
      const dateKey = date.format("YYYY-MM-DD");
      const totals = totalsByDate.get(dateKey);
      const cumulative = cumulativeByDate.get(dateKey);
      const budget = budgetByDate.get(dateKey);
      const label =
        index % labelInterval === 0 || index === days - 1
          ? date.format("D/M")
          : "";
      const pointDate = formatLocalizedDateLabel(date.toDate(), locale);

      income.push({
        value: totals?.income_total ?? 0,
        label,
        date: pointDate,
      });
      expense.push({
        value: totals?.expense_total ?? 0,
        label,
        date: pointDate,
      });
      cumulativeIncomeData.push({
        value: cumulative?.income ?? 0,
        label,
        date: pointDate,
      });
      cumulativeExpenseData.push({
        value: cumulative?.expense ?? 0,
        label,
        date: pointDate,
      });
      budgetPace.push({
        value: budget
          ? prorateAmount(budget.total_budget, date.date(), date.daysInMonth())
          : 0,
        label,
        date: pointDate,
      });
    }

    return {
      daily: { income, expense },
      cumulative: {
        income: cumulativeIncomeData,
        expense: cumulativeExpenseData,
        budgetPace,
      },
      dailyMaximum: getChartMaximum([
        ...income.map((item) => item.value),
        ...expense.map((item) => item.value),
      ]),
      cumulativeMaximum: getChartMaximum([
        ...cumulativeIncomeData.map((item) => item.value),
        ...cumulativeExpenseData.map((item) => item.value),
        ...budgetPace.map((item) => item.value),
      ]),
      hasBudget: budgetPace.some((item) => item.value > 0),
    };
  }, [
    budgetQuery.data,
    dailyTotalsQuery.data,
    endDate,
    queryStartDate,
    startDate,
    locale,
  ]);

  const incomeData = isCumulative
    ? chartData.cumulative.income
    : chartData.daily.income;
  const expenseData = isCumulative
    ? chartData.cumulative.expense
    : chartData.daily.expense;

  return {
    budgetPaceData: chartData.cumulative.budgetPace,
    dateRangeLabel: `${formatLocalizedDateLabel(
      dayjs(startDate).toDate(),
      locale,
      { includeYear: false },
    )} - ${formatLocalizedDateLabel(dayjs(endDate).toDate(), locale, {
      includeYear: false,
    })}`,
    expenseData,
    incomeData,
    isCumulative,
    isLoading:
      dailyTotalsQuery.isLoading || (isCumulative && budgetQuery.isLoading),
    maximum: isCumulative
      ? chartData.cumulativeMaximum
      : chartData.dailyMaximum,
    mode,
    setMode,
    showBudgetPace: isCumulative && chartData.hasBudget,
  };
}
