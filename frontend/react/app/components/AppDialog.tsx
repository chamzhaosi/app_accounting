import { ReactElement } from "react";
import { Dialog, Portal } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";
import AppIcon, { AppIconProps } from "./AccIcon";
import AppText from "./AppText";
import AppView from "./AppView";

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
        <AppView
          className="flex-0 flex-row items-center mx-6"
          style={{ backgroundColor: bgColor }}
        >
          {iconName && <AppIcon name={iconName} color={textColor} />}
          <AppText
            variant="headlineMedium"
            style={{ padding: 8, color: textColor }}
          >
            {title}
          </AppText>
        </AppView>
        <Dialog.Content>
          <AppText variant="bodyLarge" style={{ color: textColor }}>
            {description}
          </AppText>
        </Dialog.Content>
        <Dialog.Actions>
          <AppView
            className="flex-0 flex-row gap-2"
            style={{ backgroundColor: bgColor }}
          >
            {actionRender}
          </AppView>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
