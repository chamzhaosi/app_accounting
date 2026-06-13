import { StyleSheet, useWindowDimensions } from "react-native";
import { Modal, ModalProps, Portal } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";
import { AppIconProps } from "./AccIcon";
import AppIconButton from "./AppIconButton";
import AppListCardView, { AppListCardItemType } from "./AppListCardView";

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
  const containerWidth = width * 0.8;
  const isEmpty = iconData.length === 0;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        style={defaultStyle.modalStyle}
        contentContainerStyle={[
          defaultStyle.modalContent,
          {
            maxHeight: height * 0.5,
            width: containerWidth,
            backgroundColor: THEME.surfaceContainerHighest,
          },
        ]}
      >
        <>
          <AppIconButton
            iconName="X"
            onPress={onDismiss}
            style={defaultStyle.iconButton}
          />
          <AppListCardView
            data={iconData}
            selectedItem={selectedIcon}
            onPress={(item) => {
              onSelectedIcon(item.icon);
              onDismiss?.();
            }}
            parentWidth={containerWidth}
            numberItemInRow={5}
            isShowIconOnly
            contentContainerStyle={isEmpty ? { padding: 0 } : undefined}
          />
        </>
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
    position: "relative",
    justifyContent: "flex-start",
    alignItems: "center",
    borderRadius: 8,
  },
  iconButton: {
    zIndex: 10,
    position: "absolute",
    top: -10,
    right: -10,
  },
});
