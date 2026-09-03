import { useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Badge } from "react-native-paper";
import AppIcon from "../../../components/AppIcon";
import { useTranslation } from "../../../i18n/helper";
import { useThemeStore } from "../../../stores/useThemeStore";

type TransactionAttachmentButtonProps = {
  count: number;
  disabled?: boolean;
  visible?: boolean;
  onPress: () => void;
  iconSize?: number;
};

type TransactionAttachmentActionProps = Omit<
  TransactionAttachmentButtonProps,
  "visible"
> & {
  style?: StyleProp<ViewStyle>;
};

export function TransactionAttachmentAction({
  count,
  disabled,
  onPress,
  style,
  iconSize,
}: TransactionAttachmentActionProps) {
  const { t } = useTranslation();
  const { THEME } = useThemeStore();

  return (
    <Pressable
      accessibilityLabel={t("Attachments")}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        style,
        { opacity: disabled ? 0.45 : pressed ? 0.65 : 1 },
      ]}
    >
      <AppIcon name="Paperclip" color={THEME.primary} size={iconSize ?? 24} />
      {count > 0 && (
        <View style={styles.badgeContainer}>
          <Badge size={17}>{count}</Badge>
        </View>
      )}
    </Pressable>
  );
}

export default function TransactionAttachmentButton({
  count,
  disabled,
  visible = true,
  onPress,
}: TransactionAttachmentButtonProps) {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        visible ? (
          <TransactionAttachmentAction
            count={count}
            disabled={disabled}
            onPress={onPress}
          />
        ) : null,
    });
  }, [count, disabled, navigation, onPress, visible]);

  return null;
}

const styles = StyleSheet.create({
  badgeContainer: { position: "absolute", right: 0, top: 0 },
  button: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginRight: 4,
    position: "relative",
    width: 44,
  },
});
