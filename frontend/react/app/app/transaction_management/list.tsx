import { useInfiniteQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, SectionList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import AppEmpty from "../../components/AppEmpty";
import AppIcon, { AppIconProps } from "../../components/AppIcon";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import { FONTS } from "../../constants/fonts";
import { transactionManagementQueryKeys } from "../../constants/queryKeys";
import {
  LIST_ITEM_DESCRIPTION_FONTSIZE,
  LIST_ITEM_TITLE_FONTSIZE,
} from "../../constants/size";
import { TRANSACTION_MANAGEMENT_BASE_URL } from "../../constants/urls";
import { getTransactionMgmtList } from "../../sql/service/transactionMgmtService";
import { useThemeStore } from "../../stores/useThemeStore";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

const PAGE_SIZE = 40;
const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type AppTxnListItemType = {
  id: string;
  icon: AppIconProps["name"];
  title: string;
  subtitle: string;
  fromAccountLabel?: string;
  toAccountLabel?: string;
  amount: number;
  transactionType: TXN_TYPE_ENUM;
  transactionDate: string;
};

type TransactionDateSection = {
  transactionDate: string;
  netTotal: number;
  data: AppTxnListItemType[];
};

type TransactionManagementListProps = {
  startDate: string;
  endDate: string;
};

const capitalize = (value: string) =>
  `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatSectionDate = (dateValue: string) => {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;

  const today = new Date();
  const yesterday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 1,
  );
  const calendarDate = date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    ...(date.getFullYear() !== today.getFullYear() && { year: "numeric" }),
  });

  if (dateValue === formatDateKey(today)) {
    return `Today \u00b7 ${calendarDate}`;
  }
  if (dateValue === formatDateKey(yesterday)) {
    return `Yesterday \u00b7 ${calendarDate}`;
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    weekday: "short",
    ...(date.getFullYear() !== today.getFullYear() && { year: "numeric" }),
  });
};

const formatAmount = (amount: number) =>
  amountFormatter.format(Math.abs(amount));

const formatDailyNet = (amount: number) => {
  const prefix = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${prefix}${amountFormatter.format(Math.abs(amount))}`;
};

export default function TransactionManagementList({
  startDate,
  endDate,
}: TransactionManagementListProps) {
  const { THEME } = useThemeStore();

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
      pageSize: PAGE_SIZE,
      startDate,
      endDate,
    }),
    queryFn: ({ pageParam }) =>
      getTransactionMgmtList(pageParam, PAGE_SIZE, startDate, endDate),
    enabled: Boolean(startDate && endDate),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const transactionSections = useMemo<TransactionDateSection[]>(() => {
    const groups = new Map<string, AppTxnListItemType[]>();

    data?.pages.flat().forEach((transaction) => {
      const isIncome = transaction.transaction_type === TXN_TYPE_ENUM.INCOME;
      const isExpense = transaction.transaction_type === TXN_TYPE_ENUM.EXPENSE;
      const isTransfer =
        transaction.transaction_type === TXN_TYPE_ENUM.TRANSFER;
      const title =
        isIncome || isExpense
          ? (transaction.category_label ??
            capitalize(transaction.transaction_type))
          : isTransfer
            ? "Transfer"
            : "Balance Adjustment";
      const subtitle =
        isIncome || isExpense
          ? `${transaction.account_label ?? "Account"} \u00b7 ${capitalize(transaction.transaction_type)}`
          : isTransfer
            ? `${transaction.from_account_label ?? "Account"} \u2192 ${transaction.to_account_label ?? "Account"}`
            : (transaction.account_label ?? "Account");
      const item: AppTxnListItemType = {
        id: transaction.id,
        icon: (transaction.category_icon ??
          (isTransfer
            ? "ArrowLeftRight"
            : "WalletCards")) as AppIconProps["name"],
        title,
        subtitle,
        fromAccountLabel: isTransfer
          ? (transaction.from_account_label ?? "Account")
          : undefined,
        toAccountLabel: isTransfer
          ? (transaction.to_account_label ?? "Account")
          : undefined,
        amount: transaction.amount,
        transactionType: transaction.transaction_type,
        transactionDate: transaction.transaction_date,
      };
      const items = groups.get(item.transactionDate) ?? [];
      items.push(item);
      groups.set(item.transactionDate, items);
    });

    return Array.from(groups, ([transactionDate, items]) => ({
      transactionDate,
      netTotal: items.reduce((total, item) => {
        if (item.transactionType === TXN_TYPE_ENUM.INCOME) {
          return total + item.amount;
        }
        if (item.transactionType === TXN_TYPE_ENUM.EXPENSE) {
          return total - item.amount;
        }
        return total;
      }, 0),
      data: items,
    }));
  }, [data]);

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SectionList
      style={styles.list}
      sections={transactionSections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled
      refreshing={isRefetching && !isFetchingNextPage}
      onRefresh={onRefresh}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={[
        styles.contentContainer,
        transactionSections.length === 0 && styles.emptyContentContainer,
      ]}
      ListEmptyComponent={<AppEmpty />}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator style={styles.footerLoader} />
        ) : null
      }
      renderSectionHeader={({ section }) => {
        const netColor =
          section.netTotal > 0
            ? THEME.primary
            : section.netTotal < 0
              ? THEME.error
              : THEME.onSurfaceVariant;
        const netBackgroundColor =
          section.netTotal > 0
            ? THEME.primaryContainer
            : section.netTotal < 0
              ? THEME.errorContainer
              : THEME.surfaceContainerHighest;

        return (
          <View
            style={[
              styles.sectionHeader,
              {
                backgroundColor: THEME.surfaceContainerHigh,
                borderLeftColor: THEME.primary,
              },
            ]}
          >
            <View style={styles.sectionHeading}>
              <Text
                variant="labelSmall"
                style={[
                  styles.dailySummaryLabel,
                  { color: THEME.onSurfaceVariant },
                ]}
              >
                Daily summary
              </Text>
              <Text
                variant="titleMedium"
                style={[styles.sectionDate, { color: THEME.onSurface }]}
              >
                {formatSectionDate(section.transactionDate)}
              </Text>
            </View>

            <View
              style={[styles.netBadge, { backgroundColor: netBackgroundColor }]}
            >
              <Text variant="labelSmall" style={{ color: netColor }}>
                Net
              </Text>
              <Text
                variant="titleLarge"
                style={[styles.sectionNet, { color: netColor }]}
              >
                {formatDailyNet(section.netTotal)}
              </Text>
            </View>
          </View>
        );
      }}
      renderItem={({ item }) => {
        const isExpense = item.transactionType === TXN_TYPE_ENUM.EXPENSE;
        const isIncome = item.transactionType === TXN_TYPE_ENUM.INCOME;
        const amountColor = isExpense
          ? THEME.error
          : isIncome
            ? THEME.primary
            : THEME.onSurface;
        const iconColor = isExpense
          ? THEME.error
          : isIncome
            ? THEME.primary
            : THEME.onSurfaceVariant;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${formatAmount(item.amount)}`}
            accessibilityHint="Opens transaction details for editing"
            android_ripple={{ color: THEME.outlineVariant }}
            onPress={() =>
              router.push(
                `${TRANSACTION_MANAGEMENT_BASE_URL}/${item.id}` as Href,
              )
            }
            style={({ pressed }) => [
              styles.transactionPressable,
              { backgroundColor: THEME.surfaceContainerLow },
              pressed && [
                styles.transactionPressed,
                { backgroundColor: THEME.surfaceContainerHighest },
              ],
            ]}
          >
            <View style={styles.transactionRow}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: THEME.surfaceContainerHighest },
                ]}
              >
                <AppIcon name={item.icon} color={iconColor} size={22} />
              </View>

              <View style={styles.transactionText}>
                <Text
                  numberOfLines={1}
                  style={[styles.transactionTitle, { color: THEME.onSurface }]}
                >
                  {item.title}
                </Text>
                {item.transactionType === TXN_TYPE_ENUM.TRANSFER ? (
                  <View style={styles.transferSubtitle}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.transactionSubtitle,
                        styles.transferAccountText,
                        { color: THEME.onSurfaceVariant },
                      ]}
                    >
                      {item.fromAccountLabel}
                    </Text>
                    <View style={styles.transferArrow}>
                      <AppIcon
                        name="MoveRight"
                        color={THEME.onSurfaceVariant}
                        size={14}
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.transactionSubtitle,
                        styles.transferAccountText,
                        { color: THEME.onSurfaceVariant },
                      ]}
                    >
                      {item.toAccountLabel}
                    </Text>
                  </View>
                ) : (
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.transactionSubtitle,
                      { color: THEME.onSurfaceVariant },
                    ]}
                  >
                    {item.subtitle}
                  </Text>
                )}
              </View>

              <Text style={[styles.transactionAmount, { color: amountColor }]}>
                {formatAmount(item.amount)}
              </Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  contentContainer: {
    paddingBottom: 96,
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  sectionHeader: {
    alignItems: "center",
    borderLeftWidth: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionHeading: {
    flex: 1,
    marginRight: 12,
  },
  dailySummaryLabel: {
    fontFamily: FONTS.ROBOTO,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionDate: {
    fontFamily: FONTS.ROBOTO,
    fontWeight: "700",
    marginTop: 2,
  },
  sectionNet: {
    fontFamily: FONTS.ROBOTO,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 1,
  },
  netBadge: {
    alignItems: "flex-end",
    borderRadius: 12,
    minWidth: 96,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  transactionPressable: {
    width: "100%",
  },
  transactionPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  transactionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "nowrap",
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: "100%",
  },
  iconContainer: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    flexShrink: 0,
    width: 40,
  },
  transactionText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    minWidth: 0,
  },
  transactionTitle: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
    fontWeight: "600",
  },
  transactionSubtitle: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_DESCRIPTION_FONTSIZE - 2,
    marginTop: 2,
  },
  transferSubtitle: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 2,
    minWidth: 0,
  },
  transferAccountText: {
    flexShrink: 1,
    marginTop: 0,
  },
  transferArrow: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  transactionAmount: {
    flexShrink: 0,
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
    fontWeight: "700",
  },
  footerLoader: {
    marginVertical: 16,
  },
});
