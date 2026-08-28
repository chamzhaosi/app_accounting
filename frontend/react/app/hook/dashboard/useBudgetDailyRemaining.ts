import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { budgetQueryKeys } from "../../constants/queryKeys";
import { getBudgetDailyRemaining } from "../../sql/service/budgetService";
import { DEBUG_TAG } from "../../utils/debugLog";

export default function useBudgetDailyRemaining(
  startDate: string,
  endDate: string,
  currencyCode: string,
) {
  const query = useQuery({
    queryKey: budgetQueryKeys.dailyRemaining({
      startDate,
      endDate,
      currencyCode,
    }),
    queryFn: () => getBudgetDailyRemaining(startDate, endDate, currencyCode),
    enabled: Boolean(startDate && endDate && currencyCode),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (!query.error) return;

    console.error(
      DEBUG_TAG.BUDGET,
      "Error when loading daily remaining budget",
      query.error,
    );
  }, [query.error]);

  return query;
}
