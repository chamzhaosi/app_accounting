import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import type { AppIconProps } from "../../components/AppIcon";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import { transactionManagementQueryKeys } from "../../constants/queryKeys";
import { DEFAULT_PAGE_SIZE } from "../../constants/size";
import { getTransactionMgmtList } from "../../sql/service/transactionMgmtService";
import { capitalizeFirst } from "../../utils/text";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { useTranslation } from "../../i18n";
import { getCategoryDisplayLabel } from "../../utils/category";

export type TransactionManagementListProps = {
  startDate: string;
  endDate: string;
  accountId?: string;
  categoryId?: string;
};

export type TransactionListItem = {
  id: string;
  icon: AppIconProps["name"];
  title: string;
  subtitle: string;
  fromAccountLabel?: string;
  toAccountLabel?: string;
  accountId?: string;
  amount: number;
  balanceEffect: number;
  transactionType: TXN_TYPE_ENUM;
  transactionDate: string;
};

export type TransactionDateSection = {
  transactionDate: string;
  netTotal: number;
  data: TransactionListItem[];
};

export default function useTransactionManagementList({
  startDate,
  endDate,
  accountId,
  categoryId,
}: TransactionManagementListProps) {
  const { t } = useTranslation();
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
    }),
    queryFn: ({ pageParam }) =>
      getTransactionMgmtList(
        pageParam,
        DEFAULT_PAGE_SIZE,
        startDate,
        endDate,
        accountId,
        categoryId,
      ),
    enabled: Boolean(startDate && endDate),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === DEFAULT_PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const transactionSections = useMemo<TransactionDateSection[]>(() => {
    const groups = new Map<string, TransactionListItem[]>();

    data?.pages.flat().forEach((transaction) => {
      const isIncome = transaction.transaction_type === TXN_TYPE_ENUM.INCOME;
      const isExpense = transaction.transaction_type === TXN_TYPE_ENUM.EXPENSE;
      const isTransfer =
        transaction.transaction_type === TXN_TYPE_ENUM.TRANSFER;
      const isOutgoingTransfer =
        isTransfer && transaction.from_account_id === accountId;
      const balanceEffect = isIncome
        ? transaction.amount
        : isExpense
          ? -transaction.amount
          : isTransfer
            ? accountId
              ? isOutgoingTransfer
                ? -transaction.amount
                : transaction.amount
              : 0
            : transaction.amount;
      const title =
        isIncome || isExpense
          ? getCategoryDisplayLabel(
              transaction.category_label ??
                capitalizeFirst(transaction.transaction_type),
              transaction.category_translation_key,
              t,
            )
          : isTransfer
            ? t("Transfer")
            : t("Balance Adjustment");
      const subtitle =
        isIncome || isExpense
          ? `${transaction.account_label ?? t("Account")} · ${t(
              capitalizeFirst(transaction.transaction_type),
            )}`
          : isTransfer
            ? `${transaction.from_account_label ?? "Account"} → ${transaction.to_account_label ?? "Account"}`
            : `${transaction.account_label ?? t("Account")} · ${t(
                "Balance {{direction}}",
                {
                  direction: t(
                    transaction.amount > 0 ? "increased" : "decreased",
                  ),
                },
              )}`;
      const item: TransactionListItem = {
        id: transaction.id,
        icon: (transaction.category_icon ??
          (isTransfer
            ? "ArrowLeftRight"
            : "WalletCards")) as AppIconProps["name"],
        title,
        subtitle,
        fromAccountLabel: isTransfer
          ? (transaction.from_account_label ?? t("Account"))
          : undefined,
        toAccountLabel: isTransfer
          ? (transaction.to_account_label ?? t("Account"))
          : undefined,
        accountId: transaction.account_id ?? undefined,
        amount: transaction.amount,
        balanceEffect,
        transactionType: transaction.transaction_type,
        transactionDate: transaction.transaction_date,
      };
      const items = groups.get(item.transactionDate) ?? [];
      items.push(item);
      groups.set(item.transactionDate, items);
    });

    return Array.from(groups, ([transactionDate, items]) => ({
      transactionDate,
      netTotal: items.reduce((total, item) => total + item.balanceEffect, 0),
      data: items,
    }));
  }, [accountId, data, t]);

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
