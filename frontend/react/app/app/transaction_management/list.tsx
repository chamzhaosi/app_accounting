import { Href, router } from "expo-router";
import { Pressable, SectionList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import AppEmpty from "../../components/AppEmpty";
import AppIcon from "../../components/AppIcon";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import { FONTS } from "../../constants/fonts";
import {
  LIST_ITEM_DESCRIPTION_FONTSIZE,
  LIST_ITEM_TITLE_FONTSIZE,
} from "../../constants/size";
import {
  ACCOUNT_MANAGEMENT_BASE_URL,
  TRANSACTION_MANAGEMENT_BASE_URL,
} from "../../constants/urls";
import useTransactionManagementList from "../../hook/transaction_management/useTransactionManagementList";
import type { TransactionManagementListProps } from "../../hook/transaction_management/useTransactionManagementList";
import { useThemeStore } from "../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../stores/useAmountPrivacyStore";
import {
  formatPrivateAbsoluteAmount,
  formatPrivateSignedAmount,
} from "../../utils/number";
import { useTranslation } from "../../i18n";
import { formatLocalizedDateLabel } from "../../utils/date";

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatSectionDate = (
  dateValue: string,
  locale: string,
  t: (text: string) => string,
) => {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;

  const today = new Date();
  const yesterday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 1,
  );
  const includeYear = date.getFullYear() !== today.getFullYear();
  const calendarDate = formatLocalizedDateLabel(date, locale, {
    includeYear,
  });

  if (dateValue === formatDateKey(today)) {
    return `${t("Today")} · ${calendarDate}`;
  }
  if (dateValue === formatDateKey(yesterday)) {
    return `${t("Yesterday")} · ${calendarDate}`;
  }

  return formatLocalizedDateLabel(date, locale, {
    includeWeekday: true,
    includeYear,
  });
};

export default function TransactionManagementList(
  props: TransactionManagementListProps,
) {
  const { accountId } = props;
  const { THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const {
    isFetchingNextPage,
    isLoading,
    isRefetching,
    onLoadMore,
    onRefresh,
    transactionSections,
  } = useTransactionManagementList(props);

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
                {t("Daily summary")}
              </Text>
              <Text
                variant="titleMedium"
                style={[styles.sectionDate, { color: THEME.onSurface }]}
              >
                {formatSectionDate(section.transactionDate, locale, t)}
              </Text>
            </View>

            <View
              style={[styles.netBadge, { backgroundColor: netBackgroundColor }]}
            >
              <Text variant="labelSmall" style={{ color: netColor }}>
                {t("Net")}
              </Text>
              <Text
                variant="titleLarge"
                style={[styles.sectionNet, { color: netColor }]}
              >
                {formatPrivateSignedAmount(section.netTotal, areAmountsVisible)}
              </Text>
            </View>
          </View>
        );
      }}
      renderItem={({ item }) => {
        const isAdjustment = item.transactionType === TXN_TYPE_ENUM.ADJUSTMENT;
        const isPositiveEffect = item.balanceEffect > 0;
        const isNegativeEffect = item.balanceEffect < 0;
        const amountColor = isNegativeEffect
          ? THEME.error
          : isPositiveEffect
            ? THEME.primary
            : THEME.onSurface;
        const iconColor = isNegativeEffect
          ? THEME.error
          : isPositiveEffect
            ? THEME.primary
            : THEME.onSurfaceVariant;
        const transactionUrl =
          isAdjustment && item.accountId
            ? `${ACCOUNT_MANAGEMENT_BASE_URL}/${item.accountId}`
            : `${TRANSACTION_MANAGEMENT_BASE_URL}/${item.id}`;
        const displayAmount = accountId
          ? formatPrivateSignedAmount(item.balanceEffect, areAmountsVisible)
          : formatPrivateAbsoluteAmount(item.amount, areAmountsVisible);

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${displayAmount}`}
            accessibilityHint={
              isAdjustment
                ? t("Opens the account for balance editing")
                : t("Opens transaction details for editing")
            }
            android_ripple={{ color: THEME.outlineVariant }}
            onPress={() => router.push(transactionUrl as Href)}
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
                {displayAmount}
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
