import { Href, router } from "expo-router";
import { useState } from "react";
import { Pressable, SectionList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import AppCurrencyTotalsSheet from "../../components/AppCurrencyTotalsSheet";
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
import { compareAmounts } from "../../utils/amount";
import {
  formatPrivateCurrencyAmount,
  formatPrivateSignedCurrencyAmount,
} from "../../utils/number";
import { useTranslation } from "../../i18n/helper";
import { formatSectionDate } from "../../utils/date";
import { useReportingCurrencyStore } from "../../stores/useReportingCurrencyStore";
import type { TransactionDateSection } from "../../hook/transaction_management/useTransactionManagementList";

export default function TransactionManagementList(
  props: TransactionManagementListProps,
) {
  const { accountId, currencyCodes } = props;
  const { THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const reportingCurrencyCode = useReportingCurrencyStore(
    (state) => state.currencyCode,
  );
  const [summarySection, setSummarySection] =
    useState<TransactionDateSection | null>(null);
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const currencyOrder = new Map(
    (currencyCodes ?? []).map((code, index) => [code, index]),
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
    <>
      <AppCurrencyTotalsSheet
        title={t("Daily summary")}
        subtitle={
          summarySection
            ? formatSectionDate(summarySection.transactionDate, locale, t)
            : ""
        }
        totals={(summarySection?.currencyNets ?? []).map((net) => ({
          amount: net.netTotal,
          currencyCode: net.currencyCode,
        }))}
        visible={Boolean(summarySection)}
        onDismiss={() => setSummarySection(null)}
      />
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
          const sortedCurrencyNets = [...section.currencyNets].sort(
            (left, right) => {
              if (currencyCodes?.length) {
                return (
                  (currencyOrder.get(left.currencyCode) ??
                    Number.MAX_SAFE_INTEGER) -
                    (currencyOrder.get(right.currencyCode) ??
                      Number.MAX_SAFE_INTEGER) ||
                  left.currencyCode.localeCompare(right.currencyCode)
                );
              }
              return (
                Number(right.currencyCode === reportingCurrencyCode) -
                  Number(left.currencyCode === reportingCurrencyCode) ||
                left.currencyCode.localeCompare(right.currencyCode)
              );
            },
          );
          const primaryNet = sortedCurrencyNets[0] ?? {
            currencyCode: reportingCurrencyCode,
            netTotal: 0,
          };
          const netColor =
            primaryNet.netTotal > 0
              ? THEME.primary
              : primaryNet.netTotal < 0
                ? THEME.error
                : THEME.onSurfaceVariant;
          const netBackgroundColor =
            primaryNet.netTotal > 0
              ? THEME.primaryContainer
              : primaryNet.netTotal < 0
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

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("Open all daily currency totals")}
                disabled={sortedCurrencyNets.length <= 1}
                onPress={() =>
                  setSummarySection({
                    ...section,
                    currencyNets: sortedCurrencyNets,
                  })
                }
                style={[
                  styles.netBadge,
                  { backgroundColor: netBackgroundColor },
                ]}
              >
                <Text variant="labelSmall" style={{ color: netColor }}>
                  {t("Net")}
                </Text>
                <View style={styles.netAmountRow}>
                  <Text
                    variant="titleLarge"
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    numberOfLines={2}
                    style={[styles.sectionNet, { color: netColor }]}
                  >
                    {formatPrivateSignedCurrencyAmount(
                      primaryNet.netTotal,
                      primaryNet.currencyCode,
                      locale,
                      areAmountsVisible,
                    )}
                  </Text>
                  {sortedCurrencyNets.length > 1 ? (
                    <Text
                      variant="labelSmall"
                      style={{ color: netColor, alignSelf: "flex-end" }}
                    >
                      +{sortedCurrencyNets.length - 1}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            </View>
          );
        }}
        renderItem={({ item }) => {
          const isAdjustment =
            item.transactionType === TXN_TYPE_ENUM.ADJUSTMENT;
          const isPositiveEffect = compareAmounts(item.balanceEffect, 0) > 0;
          const isNegativeEffect = compareAmounts(item.balanceEffect, 0) < 0;
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
          const displayAmount = formatPrivateSignedCurrencyAmount(
            item.balanceEffect,
            item.primaryCurrencyCode,
            locale,
            areAmountsVisible,
          );
          const secondaryAmount = item.secondaryCurrencyCode
            ? formatPrivateCurrencyAmount(
                item.secondaryAmount,
                item.secondaryCurrencyCode,
                locale,
                areAmountsVisible,
              )
            : undefined;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.title}${
                item.description ? `, ${item.description}` : ""
              }, ${displayAmount}${
                secondaryAmount ? `, ${secondaryAmount}` : ""
              }`}
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
                    ellipsizeMode="tail"
                    style={[
                      styles.transactionTitle,
                      { color: THEME.onSurface },
                    ]}
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
                        {`${item.fromAccountCurrencyCode} - ${item.fromAccountLabel}`}
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
                        {`${item.toAccountCurrencyCode} - ${item.toAccountLabel}`}
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
                  {item.description ? (
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[
                        styles.transactionDescription,
                        { color: THEME.onSurfaceVariant },
                      ]}
                    >
                      {item.description}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.transactionAmounts}>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    numberOfLines={2}
                    style={[styles.transactionAmount, { color: amountColor }]}
                  >
                    {displayAmount}
                  </Text>
                  {secondaryAmount ? (
                    <Text
                      variant="labelSmall"
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                      numberOfLines={2}
                      style={[
                        styles.secondaryTransactionAmount,
                        { color: THEME.onSurfaceVariant },
                      ]}
                    >
                      {secondaryAmount}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </>
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
    flexShrink: 1,
    fontFamily: FONTS.ROBOTO,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 1,
    textAlign: "right",
  },
  netAmountRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    maxWidth: "100%",
    minWidth: 0,
  },
  netBadge: {
    alignItems: "flex-end",
    borderRadius: 12,
    maxWidth: "50%",
    minWidth: 96,
    minHeight: 56,
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
  transactionDescription: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_DESCRIPTION_FONTSIZE - 3,
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
    flexShrink: 1,
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
    fontWeight: "700",
    maxWidth: "100%",
    textAlign: "right",
  },
  secondaryTransactionAmount: {
    maxWidth: "100%",
    textAlign: "right",
  },
  transactionAmounts: {
    alignItems: "flex-end",
    flexShrink: 1,
    maxWidth: "50%",
    minWidth: 0,
  },
  footerLoader: {
    marginVertical: 16,
  },
});
