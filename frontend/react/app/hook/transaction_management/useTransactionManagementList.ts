import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import type { AppIconProps } from "../../components/AppIcon";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import { transactionManagementQueryKeys } from "../../constants/queryKeys";
import { DEFAULT_PAGE_SIZE } from "../../constants/size";
import { getTransactionMgmtList } from "../../sql/service/transactionMgmtService";
import { compareAmounts, multiplyAmount, sumAmounts } from "../../utils/amount";
import { capitalizeFirst } from "../../utils/text";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { useTranslation } from "../../i18n/helper";
import { getCategoryDisplayLabel } from "../category_management/categoryManagementList.utils";
import useSingleCurrencyMode from "../currency_management/useSingleCurrencyMode";
import { getTransactionAccountDisplayLabel } from "./transactionAccount.utils";

export type TransactionManagementListProps = {
  startDate: string;
  endDate: string;
  accountId?: string;
  categoryId?: string;
  currencyCode?: string;
  currencyCodes?: string[];
};

export type TransactionListItem = {
  description?: string;
  id: string;
  icon: AppIconProps["name"];
  title: string;
  subtitle: string;
  fromAccountLabel?: string;
  toAccountLabel?: string;
  accountId?: string;
  primaryAmount: number;
  primaryCurrencyCode: string;
  secondaryAmount?: number;
  secondaryCurrencyCode?: string;
  balanceEffect: number;
  dailyNetEffect: number;
  transactionType: TXN_TYPE_ENUM;
  transactionDate: string;
};

export type TransactionDateSection = {
  transactionDate: string;
  currencyNets: Array<{ currencyCode: string; netTotal: number }>;
  data: TransactionListItem[];
};

export default function useTransactionManagementList({
  startDate,
  endDate,
  accountId,
  categoryId,
  currencyCode,
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
      const isViewingOutgoingTransfer =
        isTransfer && transaction.from_account_id === accountId;
      const primaryAmount = isViewingOutgoingTransfer
        ? transaction.amount
        : transaction.converted_amount;
      const primaryCurrencyCode = isViewingOutgoingTransfer
        ? transaction.currency_code
        : transaction.account_currency_code;
      const balanceEffect = isIncome
        ? primaryAmount
        : isExpense
          ? multiplyAmount(primaryAmount, -1)
          : isTransfer
            ? accountId
              ? isViewingOutgoingTransfer
                ? multiplyAmount(primaryAmount, -1)
                : primaryAmount
              : primaryAmount
            : transaction.converted_amount;
      const dailyNetEffect = isTransfer && !accountId ? 0 : balanceEffect;
      const hasDifferentCurrencies =
        transaction.currency_code !== transaction.account_currency_code;
      const secondaryAmount = hasDifferentCurrencies
        ? isViewingOutgoingTransfer
          ? transaction.converted_amount
          : transaction.amount
        : undefined;
      const secondaryCurrencyCode = hasDifferentCurrencies
        ? isViewingOutgoingTransfer
          ? transaction.account_currency_code
          : transaction.currency_code
        : undefined;
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
          ? getTransactionAccountDisplayLabel(
              transaction.account_label ?? t("Account"),
              transaction.account_currency_code,
              isSingleCurrency,
            )
          : isTransfer
            ? `${transaction.from_account_label ?? "Account"} → ${transaction.to_account_label ?? "Account"}`
            : `${getTransactionAccountDisplayLabel(
                transaction.account_label ?? t("Account"),
                transaction.account_currency_code,
                isSingleCurrency,
              )} · ${t("Balance {{direction}}", {
                direction: t(
                  compareAmounts(transaction.amount, 0) > 0
                    ? "increased"
                    : "decreased",
                ),
              })}`;
      const item: TransactionListItem = {
        description: transaction.descriptions?.trim() || undefined,
        id: transaction.id,
        icon: (transaction.category_icon ??
          (isTransfer
            ? "ArrowLeftRight"
            : "WalletCards")) as AppIconProps["name"],
        title,
        subtitle,
        fromAccountLabel: isTransfer
          ? getTransactionAccountDisplayLabel(
              transaction.from_account_label ?? t("Account"),
              transaction.currency_code,
              isSingleCurrency,
            )
          : undefined,
        toAccountLabel: isTransfer
          ? getTransactionAccountDisplayLabel(
              transaction.to_account_label ?? t("Account"),
              transaction.account_currency_code,
              isSingleCurrency,
            )
          : undefined,
        accountId: transaction.account_id ?? undefined,
        primaryAmount,
        primaryCurrencyCode,
        secondaryAmount,
        secondaryCurrencyCode,
        balanceEffect,
        dailyNetEffect,
        transactionType: transaction.transaction_type,
        transactionDate: transaction.transaction_date,
      };
      const items = groups.get(item.transactionDate) ?? [];
      items.push(item);
      groups.set(item.transactionDate, items);
    });

    return Array.from(groups, ([transactionDate, items]) => {
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
    });
  }, [accountId, data, isSingleCurrency, t]);

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
