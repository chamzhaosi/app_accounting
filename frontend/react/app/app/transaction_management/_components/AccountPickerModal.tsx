import { Check } from "lucide-react-native";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import {
  ActivityIndicator,
  List,
  Modal,
  Portal,
  Text,
} from "react-native-paper";
import AppFloatingButton from "../../../components/AppFloatingButton";
import AppIcon from "../../../components/AppIcon";
import AppIconButton from "../../../components/AppIconButton";
import AppListView, { AppListItemType } from "../../../components/AppListView";
import AppText, { TextTypEnum } from "../../../components/AppText";
import { FONTS } from "../../../constants/fonts";
import {
  LIST_ITEM_DESCRIPTION_FONTSIZE,
  LIST_ITEM_TITLE_FONTSIZE,
} from "../../../constants/size";
import { useThemeStore } from "../../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../../stores/useAmountPrivacyStore";
import { formatPrivateAmount } from "../../../utils/number";
import { useTranslation } from "../../../i18n";

type AccountPickerModalItem = AppListItemType & {
  balance: number;
};

type AccountPickerModalProps = {
  accounts: AccountPickerModalItem[];
  error: Error | null;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  onDismiss: () => void;
  onLoadMore: () => void;
  onManageAccounts: () => void;
  onRefresh: () => Promise<unknown>;
  onSelect: (account: AccountPickerModalItem) => void;
  visible: boolean;
  selectedItem?: AccountPickerModalItem;
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
  title = "Select Account",
}: AccountPickerModalProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const { height, width } = useWindowDimensions();

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
          <AppListView
            data={accounts}
            onPress={onSelect}
            refreshing={isRefreshing && !isFetchingNextPage}
            onRefresh={onRefresh}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator style={styles.footerLoader} />
              ) : null
            }
            selectedItem={selectedItem}
            contentContainerStyle={styles.listContent}
            genCstmFlatListRenderItem={({ item }) => {
              const isSelected = selectedItem?.id === item.id;
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
                  onPress={() => onSelect(item)}
                  left={({ style }) => (
                    <View style={[style, styles.accountIconContainer]}>
                      <AppIcon
                        name={item.icon}
                        color={isSelected ? THEME.onTertiary : undefined}
                      />
                    </View>
                  )}
                  right={() => (
                    <View style={styles.accountBalanceContainer}>
                      <Text
                        style={[styles.accountBalance, { color: textColor }]}
                      >
                        {formatPrivateAmount(item.balance, areAmountsVisible)}
                      </Text>
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
        <AppFloatingButton
          icon="pencil"
          onPress={onManageAccounts}
          style={styles.manageButton}
        />
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
  accountItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingLeft: 8,
    paddingRight: 4,
  },
  accountIconContainer: {
    alignItems: "center",
    justifyContent: "center",
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
  selectionIndicator: {
    width: 20,
  },
  manageButton: {
    bottom: 0,
  },
});
