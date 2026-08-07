import { useInfiniteQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, List, Text } from "react-native-paper";
import AppIcon, { AppIconProps } from "../../components/AppIcon";
import AppListView, { AppListItemType } from "../../components/AppListView";
import { FONTS } from "../../constants/fonts";
import { transactionManagementQueryKeys } from "../../constants/queryKeys";
import { TRANSACTION_MANAGEMENT_BASE_URL } from "../../constants/urls";
import {
  LIST_ITEM_DESCRIPTION_FONTSIZE,
  LIST_ITEM_TITLE_FONTSIZE,
} from "../../constants/size";
import { getTransactionMgmtList } from "../../sql/service/transactionMgmtService";
import { useThemeStore } from "../../stores/useThemeStore";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import { ChevronDown, ChevronUp } from "lucide-react-native";

const PAGE_SIZE = 40;

type AppTxnListItemType = AppListItemType & {
  amount: string;
  amountValue: number;
  transactionType: TXN_TYPE_ENUM;
  transactionDate: string;
};

type TransactionDateGroup = AppListItemType & {
  expenseTotal: number;
  incomeTotal: number;
  transactions: AppTxnListItemType[];
};

export default function TransactionManagementList() {
  const { THEME } = useThemeStore();
  const [collapsedDateIds, setCollapsedDateIds] = useState<Set<string>>(
    new Set(),
  );

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
    queryKey: transactionManagementQueryKeys.list({ pageSize: PAGE_SIZE }),
    queryFn: ({ pageParam }) => getTransactionMgmtList(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const transactionItems = useMemo<AppTxnListItemType[]>(
    () =>
      data?.pages.flat().map((transaction) => ({
        id: transaction.id,
        icon: (transaction?.category_icon ??
          "ArrowLeftRight") as AppIconProps["name"],
        label: [TXN_TYPE_ENUM.EXPENSE, TXN_TYPE_ENUM.INCOME].includes(
          transaction.transaction_type,
        ) ? (
          <Text>
            {`${transaction.account_label} · ${transaction.category_label}`}
          </Text>
        ) : transaction.transaction_type === TXN_TYPE_ENUM.ADJUSTMENT ? (
          <Text>{transaction.account_label}</Text>
        ) : (
          <View className="flex flex-row gap-4">
            <Text style={defaultStyle.listItemLabel}>
              {transaction.from_account_label}
            </Text>
            <AppIcon name={"MoveRight"} />
            <Text style={defaultStyle.listItemLabel}>
              {transaction.to_account_label}
            </Text>
          </View>
        ),
        descriptions: transaction.descriptions ?? "",
        transactionType: transaction.transaction_type,
        amount: transaction.amount.toFixed(2),
        amountValue: transaction.amount,
        transactionDate: transaction.transaction_date,
      })) ?? [],
    [data],
  );

  const transactionGroups = useMemo<TransactionDateGroup[]>(() => {
    const groups = new Map<string, AppTxnListItemType[]>();

    transactionItems.forEach((transaction) => {
      const transactions = groups.get(transaction.transactionDate) ?? [];
      transactions.push(transaction);
      groups.set(transaction.transactionDate, transactions);
    });

    return Array.from(groups, ([transactionDate, transactions]) => {
      const dailyTotals = transactions.reduce(
        (totals, transaction) => {
          if (transaction.transactionType === TXN_TYPE_ENUM.INCOME)
            totals.income += transaction.amountValue;
          if (transaction.transactionType === TXN_TYPE_ENUM.EXPENSE)
            totals.expense += transaction.amountValue;

          return totals;
        },
        { income: 0, expense: 0 },
      );

      return {
        id: transactionDate,
        icon: "CalendarDays",
        label: `${transactionDate} (${transactions.length})`,
        incomeTotal: dailyTotals.income,
        expenseTotal: dailyTotals.expense,
        transactions,
      };
    });
  }, [transactionItems]);

  const toggleDateGroup = (id: string) => {
    setCollapsedDateIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(id)) nextIds.delete(id);
      else nextIds.add(id);

      return nextIds;
    });
  };

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
    fetchNextPage();
  };

  const onRefresh = async () => {
    debugLog(DEBUG_TAG.TRANSACTION_MANAGEMENT, "Refreshing transaction list");
    await refetch();
  };

  if (isLoading) {
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppListView<TransactionDateGroup>
      data={transactionGroups}
      isHideLeftIcon
      refreshing={isRefetching && !isFetchingNextPage}
      onRefresh={onRefresh}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      extraData={collapsedDateIds}
      genCstmFlatListRenderItem={({ item: group }) => {
        const isExpanded = !collapsedDateIds.has(group.id.toString());

        return (
          <View>
            <List.Item
              centered
              onPress={() => toggleDateGroup(group.id.toString())}
              title={group.label}
              titleStyle={defaultStyle.dateGroupLabel}
              description={
                <View style={defaultStyle.dailyTotalsContainer}>
                  <Text
                    style={[
                      defaultStyle.listItemDescription,
                      { color: THEME.primary },
                    ]}
                  >
                    Income {group.incomeTotal.toFixed(2)}
                  </Text>
                  <Text style={defaultStyle.listItemDescription}>·</Text>
                  <Text
                    style={[
                      defaultStyle.listItemDescription,
                      { color: THEME.error },
                    ]}
                  >
                    Expense {group.expenseTotal.toFixed(2)}
                  </Text>
                </View>
              }
              style={[
                defaultStyle.dateGroupContainer,
                {
                  backgroundColor: THEME.surfaceContainerHighest,
                  borderBlockColor: THEME.outline,
                },
              ]}
              rippleColor={THEME.surfaceContainerHighest}
              containerStyle={defaultStyle.containerStyle}
              left={() => <AppIcon name={group.icon} />}
              right={() =>
                isExpanded ? (
                  <ChevronUp color={THEME.onSurfaceVariant} size={20} />
                ) : (
                  <ChevronDown color={THEME.onSurfaceVariant} size={20} />
                )
              }
            />

            {isExpanded &&
              group.transactions.map((transaction) => {
                const isExp =
                  transaction.transactionType === TXN_TYPE_ENUM.EXPENSE;
                const isInc =
                  transaction.transactionType === TXN_TYPE_ENUM.INCOME;

                return (
                  <List.Item
                    key={transaction.id.toString()}
                    centered
                    onPress={() =>
                      router.push(
                        `${TRANSACTION_MANAGEMENT_BASE_URL}/${transaction.id}` as Href,
                      )
                    }
                    title={transaction.label}
                    titleStyle={defaultStyle.listItemLabel}
                    description={transaction.descriptions}
                    descriptionStyle={defaultStyle.listItemDescription}
                    style={[
                      defaultStyle.listItemContainer,
                      {
                        backgroundColor: THEME.surfaceContainer,
                        borderBlockColor: THEME.outline,
                      },
                    ]}
                    rippleColor={THEME.surfaceContainerHighest}
                    containerStyle={defaultStyle.containerStyle}
                    left={() => <AppIcon name={transaction.icon} />}
                    right={() => (
                      <Text
                        style={[
                          defaultStyle.listItemRight,
                          {
                            color: isExp
                              ? THEME.error
                              : isInc
                                ? THEME.primary
                                : undefined,
                          },
                        ]}
                      >
                        {transaction.amount}
                      </Text>
                    )}
                  />
                );
              })}
          </View>
        );
      }}
    />
  );
}

const defaultStyle = StyleSheet.create({
  listItemContainer: {
    paddingInline: 4,
    borderBottomWidth: 0.6,
  },
  listItemLabel: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
  },
  listItemDescription: {
    fontSize: LIST_ITEM_DESCRIPTION_FONTSIZE,
  },
  listItemRight: {
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
    fontWeight: "900",
  },
  dateGroupContainer: {
    borderBottomWidth: 0.6,
  },
  dateGroupLabel: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
    fontWeight: "700",
  },
  dailyTotalsContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  containerStyle: {
    marginInline: 12,
    alignItems: "center",
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
