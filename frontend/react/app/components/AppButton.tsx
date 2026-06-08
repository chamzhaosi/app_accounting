import { Button, ButtonProps } from "react-native-paper";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { useThemeStore } from "../stores/useThemeStore";

export enum ButtonType {
  PRIMARY,
  SECONDARY,
  ERROR,
}

export type AppButtonProps = ButtonProps & {
  variant?: ButtonType;
};

export default function AppButton({
  labelStyle,
  contentStyle,
  variant = ButtonType.PRIMARY,
  disabled,
  ...props
}: AppButtonProps) {
  const { THEME } = useThemeStore();

  let variantContentStyle: StyleProp<ViewStyle>;
  let variantLabelStyle: StyleProp<TextStyle>;

  switch (variant) {
    case ButtonType.ERROR:
      variantContentStyle = {
        backgroundColor: THEME.error,
      };
      variantLabelStyle = {
        color: THEME.onError,
      };
      break;
    case ButtonType.SECONDARY:
      variantContentStyle = {
        backgroundColor: THEME.secondary,
      };
      variantLabelStyle = {
        color: THEME.onSecondary,
      };
      break;
    default:
      variantContentStyle = {};
      variantLabelStyle = {};
      break;
  }

  return (
    <Button
      mode="contained"
      contentStyle={[
        {
          marginVertical: 12,
          padding: 0,
        },
        variantContentStyle,
        contentStyle,
        disabled ? { backgroundColor: THEME.surfaceDisabled } : {},
      ]}
      labelStyle={[
        {
          fontSize: 28,
        },
        variantLabelStyle,
        labelStyle,
        disabled ? { color: THEME.onSurfaceDisabled } : {},
      ]}
      {...props}
    />
  );
}
