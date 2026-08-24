import { Href, router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { SectionList, StyleSheet, View } from "react-native";
import { ActivityIndicator, List, Text } from "react-native-paper";
import AppEmpty from "../../../components/AppEmpty";
import AppIcon from "../../../components/AppIcon";
import AppView from "../../../components/AppView";
import { FONTS } from "../../../constants/fonts";
import {
  LIST_ITEM_DESCRIPTION_FONTSIZE,
  LIST_ITEM_TITLE_FONTSIZE,
} from "../../../constants/size";
import useAccountsList from "../../../hook/account_management/useAccountsList";
import { useThemeStore } from "../../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../../stores/useAmountPrivacyStore";
import { formatPrivateAmount } from "../../../utils/number";
import { useTranslation } from "../../../i18n/helper";

export default function AccountsList() {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const logic = useAccountsList();

  if (logic.isLoading) {
    return (
      <View className="h-full items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
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
            <AppIcon name={section.icon} color={THEME.primary} size={22} />
            <Text style={styles.sectionTitle}>{t(section.title)}</Text>
            <Text
              variant="labelMedium"
              style={{ color: THEME.onSurfaceVariant }}
            >
              {section.data.length}
            </Text>
          </View>
        )}
        renderItem={({ item: account }) => (
          <List.Item
            centered
            title={account.label}
            titleStyle={styles.accountLabel}
            description={account.descriptions ?? undefined}
            descriptionStyle={styles.accountDescription}
            style={[
              styles.accountItem,
              {
                backgroundColor: THEME.surfaceContainer,
                borderBottomColor: THEME.outlineVariant,
              },
            ]}
            rippleColor={THEME.surfaceContainerHighest}
            onPress={() =>
              router.push(`/(home)/accounts/${account.id}` as Href)
            }
            right={() => (
              <View style={styles.accountBalanceContainer}>
                <Text style={styles.accountBalance}>
                  {formatPrivateAmount(
                    account.current_balance,
                    areAmountsVisible,
                  )}
                </Text>
                <ChevronRight color={THEME.onSurfaceVariant} size={22} />
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
    flex: 1,
    fontFamily: FONTS.ROBOTO,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  accountItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
  },
  accountLabel: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
  },
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
