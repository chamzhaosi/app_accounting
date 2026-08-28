import { useQuery } from "@tanstack/react-query";
import { currencyManagementQueryKeys } from "../../constants/queryKeys";
import { getCurrencyPreferences } from "../../sql/service/currencyManagementService";

export default function useSingleCurrencyMode() {
  const query = useQuery({
    queryKey: currencyManagementQueryKeys.preferences(),
    queryFn: getCurrencyPreferences,
  });

  return query.data?.isSingleCurrency ?? false;
}
