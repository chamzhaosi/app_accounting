import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import type { AppIconProps } from "../../components/AppIcon";
import { accountManagementQueryKeys } from "../../constants/queryKeys";
import { DEFAULT_PAGE_SIZE } from "../../constants/size";
import { getAccMgmtList } from "../../sql/service/accMgmtService";
import type { AccMgmtRspType } from "../../sql/types/accMgmtType";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

export type AccountTypeSection = {
  typeId: string;
  title: string;
  icon: AppIconProps["name"];
  data: AccMgmtRspType[];
};

export default function useAccountsList() {
  const query = useInfiniteQuery({
    queryKey: accountManagementQueryKeys.list({ pageSize: DEFAULT_PAGE_SIZE }),
    queryFn: ({ pageParam }) => getAccMgmtList(pageParam, DEFAULT_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === DEFAULT_PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const accountSections = useMemo<AccountTypeSection[]>(() => {
    const sections = new Map<string, AccountTypeSection>();

    query.data?.pages.flat().forEach((account) => {
      const section = sections.get(account.type_id);

      if (section) {
        section.data.push(account);
        return;
      }

      sections.set(account.type_id, {
        typeId: account.type_id,
        title: account.type_label,
        icon: account.type_icon as AppIconProps["name"],
        data: [account],
      });
    });

    return Array.from(sections.values()).sort((first, second) =>
      first.title.localeCompare(second.title),
    );
  }, [query.data]);

  useEffect(() => {
    if (!query.error) return;

    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when loading accounts page",
      query.error,
    );
  }, [query.error]);

  const onLoadMore = () => {
    if (query.isFetchingNextPage || !query.hasNextPage) return;
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT, "Fetching next accounts page");
    void query.fetchNextPage();
  };

  const onRefresh = async () => {
    debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT, "Refreshing accounts page");
    await query.refetch();
  };

  return {
    accountSections,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    onLoadMore,
    onRefresh,
  };
}
