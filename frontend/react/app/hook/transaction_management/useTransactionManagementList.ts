import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import { transactionManagementQueryKeys } from "../../constants/queryKeys";
import { DEFAULT_PAGE_SIZE } from "../../constants/size";
import { getTransactionMgmtList } from "../../sql/service/transactionMgmtService";
import { sumAmounts } from "../../utils/amount";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { useTranslation } from "../../i18n/helper";
import useSingleCurrencyMode from "../currency_management/useSingleCurrencyMode";
import {
  mapTransactionListItem,
  type TransactionListItem,
} from "./transactionList.utils";

export type TransactionManagementListProps = {
  startDate: string;
  endDate: string;
  accountId?: string;
  categoryId?: string;
  currencyCode?: string;
  currencyCodes?: string[];
  creditCardStatementDate?: string;
};

export type { TransactionListItem } from "./transactionList.utils";

export type TransactionDateSection = {
  transactionDate: string;
  currencyNets: Array<{ currencyCode: string; netTotal: number }>;
  data: TransactionListItem[];
  groupTitle?: "Payments & credits" | "Statement activity";
};

export default function useTransactionManagementList({
  startDate,
  endDate,
  accountId,
  categoryId,
  currencyCode,
  creditCardStatementDate,
}: TransactionManagementListProps) {
  const { t } = useTranslation();
  const isSingleCurrency = useSingleCurrencyMode();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: transactionManagementQueryKeys.list({
      pageSize: DEFAULT_PAGE_SIZE,
      startDate,
      endDate,
      accountId,
      categoryId,
      currencyCode,
      creditCardStatementDate,
    }),
    queryFn: ({ pageParam }) =>
      getTransactionMgmtList(
        pageParam,
        DEFAULT_PAGE_SIZE,
        startDate,
        endDate,
        accountId,
        categoryId,
        currencyCode,
        creditCardStatementDate,
      ),
    enabled: Boolean(startDate && endDate),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === DEFAULT_PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const transactionSections = useMemo<TransactionDateSection[]>(() => {
    const groups = new Map<string, TransactionListItem[]>();

    data?.pages.flat().forEach((transaction) => {
      const item = mapTransactionListItem(transaction, {
        accountId,
        isSingleCurrency,
        t,
      });
      const items = groups.get(item.transactionDate) ?? [];
      items.push(item);
      groups.set(item.transactionDate, items);
    });

    const sections: TransactionDateSection[] = Array.from(
      groups,
      ([transactionDate, items]) => {
        const totals = new Map<string, number[]>();
        items.forEach((item) => {
          if (!accountId && item.transactionType === TXN_TYPE_ENUM.TRANSFER)
            return;
          const values = totals.get(item.primaryCurrencyCode) ?? [];
          values.push(item.dailyNetEffect);
          totals.set(item.primaryCurrencyCode, values);
        });
        return {
          transactionDate,
          currencyNets: Array.from(totals, ([currencyCode, values]) => ({
            currencyCode,
            netTotal: sumAmounts(values),
          })),
          data: items,
        };
      },
    );

    if (creditCardStatementDate) {
      let previousGroup: TransactionDateSection["groupTitle"];
      sections.forEach((section) => {
        const groupTitle =
          section.transactionDate >= creditCardStatementDate
            ? "Payments & credits"
            : "Statement activity";
        if (groupTitle !== previousGroup) section.groupTitle = groupTitle;
        previousGroup = groupTitle;
      });
    }

    return sections;
  }, [accountId, creditCardStatementDate, data, isSingleCurrency, t]);

  useEffect(() => {
    if (!error) return;

    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Error when getting transaction list",
      error,
    );
  }, [error]);

  const onLoadMore = () => {
    if (isFetchingNextPage || !hasNextPage) return;

    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Fetching next transaction page",
    );
    void fetchNextPage();
  };

  const onRefresh = async () => {
    debugLog(DEBUG_TAG.TRANSACTION_MANAGEMENT, "Refreshing transaction list");
    await refetch();
  };

  return {
    isFetchingNextPage,
    isLoading,
    isRefetching,
    onLoadMore,
    onRefresh,
    transactionSections,
  };
}
