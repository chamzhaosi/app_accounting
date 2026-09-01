import { Href, router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, SectionList, StyleSheet, View } from "react-native";
import { ActivityIndicator, List, Text, Tooltip } from "react-native-paper";
import AppCurrencyTotalsSheet from "../../../components/AppCurrencyTotalsSheet";
import AppEmpty from "../../../components/AppEmpty";
import AppIcon from "../../../components/AppIcon";
import AppView from "../../../components/AppView";
import { FONTS } from "../../../constants/fonts";
import {
  LIST_ITEM_DESCRIPTION_FONTSIZE,
  LIST_ITEM_TITLE_FONTSIZE,
} from "../../../constants/size";
import useAccountsList from "../../../hook/account_management/useAccountsList";
import useSingleCurrencyMode from "../../../hook/currency_management/useSingleCurrencyMode";
import { useThemeStore } from "../../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../../stores/useAmountPrivacyStore";
import { formatPrivateCurrencyAmount } from "../../../utils/number";
import { useTranslation } from "../../../i18n/helper";
import AccountsBalanceSummary from "./_components/AccountsBalanceSummary";

export default function AccountsList() {
  const { THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const logic = useAccountsList();
  const isSingleCurrency = useSingleCurrencyMode();

  if (logic.isLoading) {
    return (
      <View className="h-full items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
      <AppCurrencyTotalsSheet
        title={logic.selectedTotals ? t(logic.selectedTotals.title) : ""}
        subtitle={t("Balance by currency")}
        totals={logic.selectedTotals?.totals ?? []}
        visible={Boolean(logic.selectedTotals)}
        onDismiss={logic.closeCurrencyTotals}
      />
      <SectionList
        sections={logic.accountSections}
        keyExtractor={(account) => account.id}
        stickySectionHeadersEnabled
        refreshing={logic.isRefetching && !logic.isFetchingNextPage}
        onRefresh={logic.onRefresh}
        onEndReached={logic.onLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={[
          styles.contentContainer,
          logic.accountSections.length === 0 && styles.emptyContentContainer,
        ]}
        ListEmptyComponent={<AppEmpty />}
        ListHeaderComponent={<AccountsBalanceSummary />}
        renderSectionHeader={({ section }) => (
          <View
            style={[
              styles.sectionHeader,
              {
                backgroundColor: THEME.surfaceContainerHigh,
                borderBottomColor: THEME.outlineVariant,
              },
            ]}
          >
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: THEME.primaryContainer },
              ]}
            >
              <AppIcon
                name={section.icon}
                color={THEME.onPrimaryContainer}
                size={20}
              />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{t(section.title)}</Text>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: THEME.surfaceContainerHighest },
                ]}
              >
                <Text
                  variant="labelMedium"
                  style={{ color: THEME.onSurfaceVariant }}
                >
                  {section.accountCount}
                </Text>
              </View>
            </View>
            <Pressable
              accessibilityRole={
                section.totals.length > 2 ? "button" : undefined
              }
              accessibilityLabel={
                section.totals.length > 2
                  ? t("Open all currency totals")
                  : undefined
              }
              disabled={section.totals.length <= 2}
              onPress={() => logic.openCurrencyTotals(section)}
              style={styles.sectionTotals}
            >
              {section.totals.slice(0, 2).map((total) => (
                <Text
                  key={total.currencyCode}
                  variant="labelMedium"
                  style={{ color: THEME.onSurfaceVariant }}
                >
                  {formatPrivateCurrencyAmount(
                    total.amount,
                    total.currencyCode,
                    locale,
                    areAmountsVisible,
                  )}
                </Text>
              ))}
              {section.totals.length > 2 && (
                <Text
                  variant="labelSmall"
                  style={[styles.moreTotals, { color: THEME.primary }]}
                >
                  (+{section.totals.length - 2})
                </Text>
              )}
            </Pressable>
          </View>
        )}
        renderItem={({ item: account }) => (
          <List.Item
            centered
            title={
              <View style={styles.accountTitleRow}>
                <Text
                  style={[
                    styles.accountLabel,
                    !account.is_active && { color: THEME.outline },
                  ]}
                >
                  {account.label}
                </Text>
                {!account.is_asset && (
                  <Tooltip title={t("Excluded from assets")}>
                    <View accessibilityLabel={t("Excluded from assets")}>
                      <AppIcon
                        name="BotOff"
                        color={THEME.onSurfaceVariant}
                        size={16}
                      />
                    </View>
                  </Tooltip>
                )}
              </View>
            }
            titleStyle={styles.accountLabel}
            description={account.descriptions ?? undefined}
            descriptionStyle={[
              styles.accountDescription,
              !account.is_active && { color: THEME.outline },
            ]}
            style={[
              styles.accountItem,
              {
                backgroundColor: account.is_active
                  ? THEME.surfaceContainer
                  : THEME.surfaceContainerHighest,
                borderBottomColor: THEME.outlineVariant,
              },
            ]}
            rippleColor={THEME.surfaceContainerHighest}
            onPress={() =>
              router.push(`/(home)/accounts/${account.id}` as Href)
            }
            right={() => (
              <View style={styles.accountBalanceContainer}>
                <Text
                  style={[
                    styles.accountBalance,
                    !account.is_active && { color: THEME.outline },
                  ]}
                >
                  {formatPrivateCurrencyAmount(
                    account.current_balance,
                    account.currency_code,
                    locale,
                    areAmountsVisible,
                    !isSingleCurrency,
                  )}
                </Text>
                <ChevronRight
                  color={
                    account.is_active ? THEME.onSurfaceVariant : THEME.outline
                  }
                  size={22}
                />
              </View>
            )}
          />
        )}
        ListFooterComponent={
          logic.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null
        }
      />
    </AppView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 24,
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  sectionHeader: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontFamily: FONTS.ROBOTO,
    fontSize: 16,
    fontWeight: "700",
  },
  sectionTitleContainer: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
    marginLeft: 10,
  },
  sectionTotals: { alignItems: "flex-end", marginLeft: 12 },
  sectionIcon: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  countBadge: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  moreTotals: { fontWeight: "700", marginTop: 1 },
  accountItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
  },
  accountLabel: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
  },
  accountTitleRow: { alignItems: "center", flexDirection: "row", gap: 6 },
  accountDescription: {
    fontSize: LIST_ITEM_DESCRIPTION_FONTSIZE,
  },
  accountBalanceContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  accountBalance: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
    fontWeight: "700",
    marginRight: 8,
  },
  footerLoader: {
    marginVertical: 16,
  },
});
