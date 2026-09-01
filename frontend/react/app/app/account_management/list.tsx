import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { SectionList, StyleSheet, View } from "react-native";
import { ActivityIndicator, List, Text, Tooltip } from "react-native-paper";
import AppEmpty from "../../components/AppEmpty";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppIcon from "../../components/AppIcon";
import AppView from "../../components/AppView";
import { FONTS } from "../../constants/fonts";
import {
  LIST_ITEM_DESCRIPTION_FONTSIZE,
  LIST_ITEM_TITLE_FONTSIZE,
} from "../../constants/size";
import {
  ACCOUNT_MANAGEMENT_BASE_URL,
  ACCOUNT_MANAGEMENT_CREATE_URL,
} from "../../constants/urls";
import useAccountManagementList from "../../hook/account_management/useAccountManagementList";
import useSingleCurrencyMode from "../../hook/currency_management/useSingleCurrencyMode";
import { useTranslation } from "../../i18n/helper";
import { useAmountPrivacyStore } from "../../stores/useAmountPrivacyStore";
import { useThemeStore } from "../../stores/useThemeStore";
import { formatPrivateCurrencyAmount } from "../../utils/number";

export default function AccountManagementList() {
  const logic = useAccountManagementList();
  const { THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const isSingleCurrency = useSingleCurrencyMode();

  if (logic.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppView className="relative bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
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
        ListFooterComponent={
          logic.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null
        }
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
              router.push(`${ACCOUNT_MANAGEMENT_BASE_URL}/${account.id}`)
            }
            right={() => (
              <View style={styles.accountValueContainer}>
                <View style={styles.accountValue}>
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
                </View>
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
      />
      <AppFloatingButton
        icon="plus"
        onPress={() => router.push(ACCOUNT_MANAGEMENT_CREATE_URL)}
      />
    </AppView>
  );
}

const styles = StyleSheet.create({
  accountBalance: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
    fontWeight: "700",
  },
  accountDescription: { fontSize: LIST_ITEM_DESCRIPTION_FONTSIZE },
  accountItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
  },
  accountLabel: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
  },
  accountTitleRow: { alignItems: "center", flexDirection: "row", gap: 6 },
  accountValue: { alignItems: "flex-end", marginRight: 8 },
  accountValueContainer: { alignItems: "center", flexDirection: "row" },
  contentContainer: { paddingBottom: 96 },
  countBadge: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  emptyContentContainer: { flexGrow: 1, justifyContent: "center" },
  footerLoader: { marginVertical: 16 },
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  sectionHeader: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionIcon: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: FONTS.ROBOTO,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
});
