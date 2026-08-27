import { ReactElement } from "react";
import { View } from "react-native";
import { Dialog, Portal, Text } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";
import AppIcon, { AppIconProps } from "./AppIcon";
import AppText from "./AppText";
import { useTranslation } from "../i18n/helper";

type AppDialogProps = {
  title: string;
  iconName?: AppIconProps["name"];
  description: string;
  descriptionValues?: Record<string, string | number>;
  highlightedDescriptionValue?: string;
  showDialog: boolean;
  onDismiss: () => void;
  actionRender: ReactElement;
};

export default function AppDialog({
  title,
  iconName,
  description,
  descriptionValues,
  highlightedDescriptionValue,
  showDialog,
  onDismiss,
  actionRender,
}: AppDialogProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const bgColor = THEME.tertiaryContainer;
  const textColor = THEME.onTertiaryContainer;
  const translatedDescription = t(description, descriptionValues);
  const highlightIndex = highlightedDescriptionValue
    ? translatedDescription.indexOf(highlightedDescriptionValue)
    : -1;

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
            {t(title)}
          </AppText>
        </View>
        <Dialog.Content>
          <Text variant="bodyLarge" style={{ color: textColor }}>
            {highlightIndex >= 0 && highlightedDescriptionValue ? (
              <>
                {translatedDescription.slice(0, highlightIndex)}
                <Text
                  variant="bodyLarge"
                  style={{ color: THEME.primary, fontWeight: "800" }}
                >
                  {highlightedDescriptionValue}
                </Text>
                {translatedDescription.slice(
                  highlightIndex + highlightedDescriptionValue.length,
                )}
              </>
            ) : (
              translatedDescription
            )}
          </Text>
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
