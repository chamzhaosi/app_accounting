import { Button, ButtonProps } from "react-native-paper";
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from "react-native";
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
  style,
  ...props
}: AppButtonProps) {
  const { THEME } = useThemeStore();

  let variantStyle: StyleProp<ViewStyle> = {};
  let variantContentStyle: StyleProp<ViewStyle> = {};
  let variantLabelStyle: StyleProp<TextStyle> = {};

  switch (variant) {
    case ButtonType.ERROR:
      variantStyle = {
        backgroundColor: THEME.error,
      };
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
      break;
  }

  return (
    <Button
      mode="contained"
      contentStyle={[
        defaultStyle.contentStyle,
        ...(!disabled ? [variantContentStyle] : []),
        contentStyle,
      ]}
      labelStyle={[
        defaultStyle.labelStyle,
        ...(!disabled ? [variantLabelStyle] : []),
        labelStyle,
      ]}
      style={[...(!disabled ? [variantStyle] : []), style]}
      disabled={disabled}
      {...props}
    />
  );
}

const defaultStyle = StyleSheet.create({
  contentStyle: {
    marginVertical: 12,
    padding: 0,
  },
  labelStyle: {
    fontSize: 28,
    fontWeight: 700,
  },
});

export const SUBMIT_BTN_CONTENT_STYLE = {
  contentStyle: {
    marginBlock: 0,
    height: 45,
  },
  labelStyle: {
    fontSize: 18,
  },
};

export const AUTH_SUBMIT_BTN_CONTENT_STYLE = {
  style: { borderRadius: 4 },
  contentStyle: {
    marginVertical: 4,
  },
  labelStyle: {
    fontSize: 20,
  },
};
