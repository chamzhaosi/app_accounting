import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import { transactionManagementQueryKeys } from "../../constants/queryKeys";
import { getFrequentTransactionDescriptions } from "../../sql/service/transactionMgmtService";

const DESCRIPTION_SEARCH_DEBOUNCE_MS = 250;

export default function useFrequentTransactionDescriptions(
  categoryId: string,
  transactionType: TXN_TYPE_ENUM,
  searchText = "",
) {
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setDebouncedSearchText(searchText),
      DESCRIPTION_SEARCH_DEBOUNCE_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const { data = [] } = useQuery({
    queryKey: transactionManagementQueryKeys.frequentDescriptions(
      categoryId,
      debouncedSearchText,
    ),
    queryFn: () =>
      getFrequentTransactionDescriptions(categoryId, debouncedSearchText),
    enabled: Boolean(categoryId) && transactionType !== TXN_TYPE_ENUM.TRANSFER,
    placeholderData: (previousData) => previousData,
  });

  return transactionType === TXN_TYPE_ENUM.TRANSFER || !categoryId ? [] : data;
}
