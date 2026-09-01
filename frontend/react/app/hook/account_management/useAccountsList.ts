import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { AppCurrencyTotal } from "../../components/AppCurrencyTotalsSheet";
import type { AppIconProps } from "../../components/AppIcon";
import { accountManagementQueryKeys } from "../../constants/queryKeys";
import { DEFAULT_PAGE_SIZE } from "../../constants/size";
import {
  getAccountTypeBalanceTotals,
  getAccMgmtList,
} from "../../sql/service/accMgmtService";
import type { AccMgmtRspType } from "../../sql/types/accMgmtType";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

export type AccountTypeSection = {
  typeId: string;
  title: string;
  icon: AppIconProps["name"];
  data: AccMgmtRspType[];
  totals: AppCurrencyTotal[];
  accountCount: number;
};

export default function useAccountsList() {
  const [selectedTotals, setSelectedTotals] = useState<{
    title: string;
    totals: AppCurrencyTotal[];
  } | null>(null);
  const query = useInfiniteQuery({
    queryKey: accountManagementQueryKeys.list({ pageSize: DEFAULT_PAGE_SIZE }),
    queryFn: ({ pageParam }) => getAccMgmtList(pageParam, DEFAULT_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === DEFAULT_PAGE_SIZE ? allPages.length + 1 : undefined,
  });
  const totalsQuery = useQuery({
    queryKey: accountManagementQueryKeys.typeBalanceTotals(),
    queryFn: getAccountTypeBalanceTotals,
  });

  const accountSections = useMemo<AccountTypeSection[]>(() => {
    const sections = new Map<string, AccountTypeSection>();

    query.data?.pages.flat().forEach((account) => {
      const section = sections.get(account.type_id);

      if (section) {
        section.data.push(account);
        if (!totalsQuery.data) section.accountCount = section.data.length;
        return;
      }

      sections.set(account.type_id, {
        typeId: account.type_id,
        title: account.type_label,
        icon: account.type_icon as AppIconProps["name"],
        data: [account],
        accountCount:
          totalsQuery.data?.find((total) => total.type_id === account.type_id)
            ?.account_count ?? 1,
        totals:
          totalsQuery.data
            ?.filter((total) => total.type_id === account.type_id)
            .map((total) => ({
              amount: total.balance,
              currencyCode: total.currency_code,
            })) ?? [],
      });
    });

    return Array.from(sections.values()).sort((first, second) =>
      first.title.localeCompare(second.title),
    );
  }, [query.data, totalsQuery.data]);

  useEffect(() => {
    if (!query.error) return;

    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when loading accounts page",
      query.error,
    );
  }, [query.error]);

  useEffect(() => {
    if (!totalsQuery.error) return;
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when loading account type balance totals",
      totalsQuery.error,
    );
  }, [totalsQuery.error]);

  const onLoadMore = () => {
    if (query.isFetchingNextPage || !query.hasNextPage) return;
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT, "Fetching next accounts page");
    void query.fetchNextPage();
  };

  const onRefresh = async () => {
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT, "Refreshing accounts page");
    await Promise.all([query.refetch(), totalsQuery.refetch()]);
  };

  return {
    accountSections,
    closeCurrencyTotals: () => setSelectedTotals(null),
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    onLoadMore,
    openCurrencyTotals: (section: AccountTypeSection) =>
      setSelectedTotals({ title: section.title, totals: section.totals }),
    onRefresh,
    selectedTotals,
  };
}
