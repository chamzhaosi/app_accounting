import { StyleSheet, useWindowDimensions, View } from "react-native";
import { ActivityIndicator, Modal, Portal } from "react-native-paper";
import AppFloatingButton from "../../../components/AppFloatingButton";
import AppIconButton from "../../../components/AppIconButton";
import AppListView, { AppListItemType } from "../../../components/AppListView";
import AppText, { TextTypEnum } from "../../../components/AppText";
import { useThemeStore } from "../../../stores/useThemeStore";

type AccountPickerModalProps = {
  accounts: AppListItemType[];
  error: Error | null;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  onDismiss: () => void;
  onLoadMore: () => void;
  onManageAccounts: () => void;
  onRefresh: () => Promise<unknown>;
  onSelect: (account: AppListItemType) => void;
  visible: boolean;
  selectedItem?: AppListItemType;
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
          <AppText variant="titleLarge">{title}</AppText>
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
            isHideLeftIcon={true}
            selectedItem={selectedItem}
            contentContainerStyle={styles.listContent}
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
  manageButton: {
    bottom: 0,
  },
});
