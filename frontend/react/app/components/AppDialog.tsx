import { ReactElement } from "react";
import { View } from "react-native";
import { Dialog, Portal } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";
import AppIcon, { AppIconProps } from "./AppIcon";
import AppText from "./AppText";

type AppDialogProps = {
  title: string;
  iconName?: AppIconProps["name"];
  description: string;
  showDialog: boolean;
  onDismiss: () => void;
  actionRender: ReactElement;
};

export default function AppDialog({
  title,
  iconName,
  description,
  showDialog,
  onDismiss,
  actionRender,
}: AppDialogProps) {
  const { THEME } = useThemeStore();
  const bgColor = THEME.tertiaryContainer;
  const textColor = THEME.onTertiaryContainer;

  return (
    <Portal>
      <Dialog
        visible={showDialog}
        onDismiss={onDismiss}
        style={{ backgroundColor: bgColor }}
      >
        <View
          className="flex-row items-center mx-6"
          style={{ backgroundColor: bgColor }}
        >
          {iconName && <AppIcon name={iconName} color={textColor} />}
          <AppText
            variant="headlineMedium"
            style={{ padding: 8, color: textColor }}
          >
            {title}
          </AppText>
        </View>
        <Dialog.Content>
          <AppText variant="bodyLarge" style={{ color: textColor }}>
            {description}
          </AppText>
        </Dialog.Content>
        <Dialog.Actions>
          <View className="flex-row gap-2" style={{ backgroundColor: bgColor }}>
            {actionRender}
          </View>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
