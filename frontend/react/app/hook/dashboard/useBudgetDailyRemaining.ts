import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { budgetQueryKeys } from "../../constants/queryKeys";
import { getBudgetDailyRemaining } from "../../sql/service/budgetService";
import { DEBUG_TAG } from "../../utils/debugLog";

export default function useBudgetDailyRemaining(
  startDate: string,
  endDate: string,
) {
  const query = useQuery({
    queryKey: budgetQueryKeys.dailyRemaining({ startDate, endDate }),
    queryFn: () => getBudgetDailyRemaining(startDate, endDate),
    enabled: Boolean(startDate && endDate),
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
