import { useQuery } from "@tanstack/react-query";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import { transactionManagementQueryKeys } from "../../constants/queryKeys";
import { getFrequentTransactionDescriptions } from "../../sql/service/transactionMgmtService";

export default function useFrequentTransactionDescriptions(
  categoryId: string,
  transactionType: TXN_TYPE_ENUM,
) {
  const { data = [] } = useQuery({
    queryKey: transactionManagementQueryKeys.frequentDescriptions(categoryId),
    queryFn: () => getFrequentTransactionDescriptions(categoryId),
    enabled: Boolean(categoryId) && transactionType !== TXN_TYPE_ENUM.TRANSFER,
  });

  return transactionType === TXN_TYPE_ENUM.TRANSFER || !categoryId ? [] : data;
}
