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
  ...props
}: AppButtonProps) {
  const { THEME } = useThemeStore();

  let variantContentStyle: StyleProp<ViewStyle> = {};
  let variantLabelStyle: StyleProp<TextStyle> = {};

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
      break;
  }

  return (
    <Button
      mode="contained"
      // style={[
      //   disabled
      //     ? {
      //         backgroundColor: THEME.surfaceDisabled,
      //       }
      //     : {},
      // ]}
      contentStyle={[
        defaultStyle.contentStyle,
        ...(!disabled ? [variantContentStyle] : []),
        contentStyle,
        // disabled ? { backgroundColor: THEME.surfaceDisabled } : {},
      ]}
      labelStyle={[
        defaultStyle.labelStyle,
        ...(!disabled ? [variantLabelStyle] : []),
        labelStyle,
        // disabled ? { color: THEME.onSurfaceDisabled } : {},
      ]}
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
