import { useMemo, useState } from "react";
import { Keyboard, StyleSheet, useWindowDimensions, View } from "react-native";
import { Modal, ModalProps, Portal, Searchbar } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";
import { AppIconProps } from "./AppIcon";
import AppIconButton from "./AppIconButton";
import AppListCardView, { AppListCardItemType } from "./AppListCardView";
import AppText from "./AppText";

const normalizeSearchTerm = (value: string) =>
  value.replace(/[^a-z0-9]/gi, "").toLowerCase();

type AppIconModalProps = Omit<ModalProps, "children"> & {
  selectedIcon?: AppIconProps["name"];
  onSelectedIcon: (item: AppIconProps["name"]) => void;
  iconData: AppListCardItemType[];
};

export default function AppIconModal({
  iconData = [],
  visible,
  onDismiss,
  selectedIcon,
  onSelectedIcon,
}: AppIconModalProps) {
  const { THEME } = useThemeStore();
  const { height, width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState("");
  const containerWidth = Math.min(width - 32, 560);
  const numberItemInRow =
    containerWidth >= 480 ? 7 : containerWidth >= 360 ? 6 : 5;
  const searchTokens = useMemo(
    () => searchQuery.match(/[a-z0-9]+/gi)?.map(normalizeSearchTerm) ?? [],
    [searchQuery],
  );
  const filteredIconData = useMemo(
    () =>
      searchTokens.length
        ? iconData.filter((item) => {
            const searchableTerms = [
              item.icon,
              item.label,
              ...(item.searchTerms ?? []),
            ].map(normalizeSearchTerm);

            return searchTokens.every((token) =>
              searchableTerms.some((term) => term.includes(token)),
            );
          })
        : iconData,
    [iconData, searchTokens],
  );
  const isEmpty = filteredIconData.length === 0;

  const dismissModal = () => {
    setSearchQuery("");
    Keyboard.dismiss();
    onDismiss?.();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={dismissModal}
        style={defaultStyle.modalStyle}
        contentContainerStyle={[
          defaultStyle.modalContent,
          {
            height: Math.min(height * 0.76, 680),
            width: containerWidth,
            backgroundColor: THEME.surfaceContainerHigh,
          },
        ]}
      >
        <View style={defaultStyle.header}>
          <View style={defaultStyle.titleContainer}>
            <AppText variant="titleLarge">Choose an icon</AppText>
            <AppText
              variant="bodyMedium"
              style={{ color: THEME.onSurfaceVariant }}
            >
              {filteredIconData.length} of {iconData.length} icons
            </AppText>
          </View>
          <AppIconButton
            iconName="X"
            accessibilityLabel="Close icon picker"
            onPress={dismissModal}
            style={defaultStyle.closeButton}
          />
        </View>

        <Searchbar
          accessibilityLabel="Search icons"
          placeholder="Search icons, e.g. food"
          value={searchQuery}
          onChangeText={setSearchQuery}
          elevation={0}
          style={[
            defaultStyle.searchBar,
            { backgroundColor: THEME.surfaceContainerLowest },
          ]}
          inputStyle={defaultStyle.searchInput}
        />

        <View style={defaultStyle.listContainer}>
          <AppListCardView
            data={filteredIconData}
            selectedItem={selectedIcon}
            onPress={(item) => {
              onSelectedIcon(item.icon);
              dismissModal();
            }}
            parentWidth={containerWidth}
            numberItemInRow={numberItemInRow}
            isShowIconOnly
            elevation={0}
            keyboardDismissMode="on-drag"
            ListEmptyComponent={null}
            contentContainerStyle={isEmpty ? { padding: 0 } : undefined}
          />
          {isEmpty && (
            <View style={defaultStyle.emptyContainer}>
              <AppText variant="titleMedium">No matching icons</AppText>
              <AppText
                variant="bodyMedium"
                style={{ color: THEME.onSurfaceVariant }}
              >
                Try another search term.
              </AppText>
            </View>
          )}
        </View>
      </Modal>
    </Portal>
  );
}

const defaultStyle = StyleSheet.create({
  modalStyle: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 24,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  titleContainer: {
    gap: 2,
  },
  closeButton: {
    borderRadius: 20,
    padding: 6,
  },
  searchBar: {
    borderRadius: 16,
    height: 48,
    marginHorizontal: 20,
    marginTop: 16,
  },
  searchInput: {
    minHeight: 48,
  },
  listContainer: {
    flex: 1,
    marginTop: 4,
  },
  emptyContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    gap: 4,
    justifyContent: "center",
  },
});
