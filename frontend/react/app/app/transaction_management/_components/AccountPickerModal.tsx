import { Check } from "lucide-react-native";
import { useMemo } from "react";
import {
  SectionList,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  ActivityIndicator,
  List,
  Modal,
  Portal,
  Text,
} from "react-native-paper";
import AppFloatingButton from "../../../components/AppFloatingButton";
import AppEmpty from "../../../components/AppEmpty";
import AppIcon from "../../../components/AppIcon";
import AppIconButton from "../../../components/AppIconButton";
import { AppListItemType } from "../../../components/AppListView";
import AppText, { TextTypEnum } from "../../../components/AppText";
import { FONTS } from "../../../constants/fonts";
import {
  LIST_ITEM_DESCRIPTION_FONTSIZE,
  LIST_ITEM_TITLE_FONTSIZE,
} from "../../../constants/size";
import { useThemeStore } from "../../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../../stores/useAmountPrivacyStore";
import { formatPrivateCurrencyAmount } from "../../../utils/number";
import { DEFAULT_CURRENCY_CODE } from "../../../constants/currencies";
import { useTranslation } from "../../../i18n/helper";
import useSingleCurrencyMode from "../../../hook/currency_management/useSingleCurrencyMode";

export type AccountPickerModalItem = AppListItemType & {
  balance: number;
  currencyCode?: string;
  inputLabel: string;
  typeId: string;
  typeLabel: string;
  typeIcon: AppListItemType["icon"];
  disabled?: boolean;
};

type AccountPickerSection = {
  typeId: string;
  title: string;
  icon: AppListItemType["icon"];
  data: AccountPickerModalItem[];
};

type AccountPickerModalProps = {
  accounts: AccountPickerModalItem[];
  error: Error | null;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  onDismiss: () => void;
  onLoadMore: () => void;
  onManageAccounts?: () => void;
  onRefresh: () => Promise<unknown>;
  onSelect: (account: AccountPickerModalItem) => void;
  visible: boolean;
  selectedItem?: AccountPickerModalItem;
  selectedItems?: AccountPickerModalItem[];
  title?: string;
};

export default function AccountPickerModal({
  accounts,
  error,
  isFetchingNextPage,
  isLoading,
  isRefreshing,
  onDismiss,
  onLoadMore,
  onManageAccounts,
  onRefresh,
  onSelect,
  visible,
  selectedItem,
  selectedItems,
  title = "Select Account",
}: AccountPickerModalProps) {
  const { THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const isSingleCurrency = useSingleCurrencyMode();
  const { height, width } = useWindowDimensions();
  const accountSections = useMemo<AccountPickerSection[]>(() => {
    const sections = new Map<string, AccountPickerSection>();

    accounts.forEach((account) => {
      const existingSection = sections.get(account.typeId);
      if (existingSection) {
        existingSection.data.push(account);
        return;
      }

      sections.set(account.typeId, {
        typeId: account.typeId,
        title: account.typeLabel,
        icon: account.typeIcon,
        data: [account],
      });
    });

    return Array.from(sections.values()).sort((left, right) =>
      left.title.localeCompare(right.title),
    );
  }, [accounts]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        style={styles.modal}
        contentContainerStyle={[
          styles.content,
          {
            backgroundColor: THEME.surfaceContainer,
            height: height * 0.7,
            width: width * 0.9,
          },
        ]}
      >
        <View style={styles.header}>
          <AppText variant="titleLarge">{t(title)}</AppText>
          <AppIconButton iconName="X" onPress={onDismiss} />
        </View>

        {error && (
          <AppText type={TextTypEnum.ERROR} style={styles.errorMessage}>
            Unable to load accounts. Pull down to try again.
          </AppText>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <SectionList
            sections={accountSections}
            keyExtractor={(item) => item.id.toString()}
            stickySectionHeadersEnabled
            refreshing={isRefreshing && !isFetchingNextPage}
            onRefresh={onRefresh}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator style={styles.footerLoader} />
              ) : null
            }
            ListEmptyComponent={<AppEmpty />}
            contentContainerStyle={[
              styles.listContent,
              accountSections.length === 0 && styles.emptyListContent,
            ]}
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
                    {section.data.length}
                  </Text>
                </View>
              </View>
            )}
            renderItem={({ item }) => {
              const isSelected =
                selectedItem?.id === item.id ||
                selectedItems?.some((selected) => selected.id === item.id);
              const textColor = isSelected ? THEME.onTertiary : THEME.onSurface;

              return (
                <List.Item
                  centered
                  title={item.label}
                  titleStyle={[styles.accountLabel, { color: textColor }]}
                  description={item.descriptions}
                  descriptionStyle={[
                    styles.accountDescription,
                    {
                      color: isSelected
                        ? THEME.onTertiary
                        : THEME.onSurfaceVariant,
                    },
                  ]}
                  style={[
                    styles.accountItem,
                    {
                      backgroundColor: isSelected
                        ? THEME.tertiary
                        : THEME.surfaceContainer,
                      borderBottomColor: THEME.outlineVariant,
                    },
                  ]}
                  rippleColor={THEME.surfaceContainerHighest}
                  disabled={item.disabled}
                  onPress={() => {
                    if (!item.disabled) onSelect(item);
                  }}
                  right={() => (
                    <View style={styles.accountBalanceContainer}>
                      <View style={styles.accountValue}>
                        {item.currencyCode && !isSingleCurrency && (
                          <Text
                            variant="labelSmall"
                            style={{
                              color: isSelected
                                ? THEME.onTertiary
                                : THEME.onSurfaceVariant,
                            }}
                          >
                            {item.currencyCode}
                          </Text>
                        )}
                        <Text
                          style={[styles.accountBalance, { color: textColor }]}
                        >
                          {formatPrivateCurrencyAmount(
                            item.balance,
                            item.currencyCode ?? DEFAULT_CURRENCY_CODE,
                            locale,
                            areAmountsVisible,
                            !isSingleCurrency,
                          )}
                        </Text>
                      </View>
                      <View style={styles.selectionIndicator}>
                        {isSelected && (
                          <Check color={THEME.onTertiary} size={20} />
                        )}
                      </View>
                    </View>
                  )}
                />
              );
            }}
          />
        )}
        {onManageAccounts ? (
          <AppFloatingButton
            icon="pencil"
            onPress={onManageAccounts}
            style={styles.manageButton}
          />
        ) : null}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorMessage: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  footerLoader: {
    marginVertical: 12,
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  accountItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingLeft: 8,
    paddingRight: 4,
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
  },
  accountValue: { alignItems: "flex-end", marginRight: 8 },
  selectionIndicator: {
    width: 20,
  },
  manageButton: {
    bottom: 0,
  },
  countBadge: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
