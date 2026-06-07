import { Button, ButtonProps } from "react-native-paper";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { useThemeStore } from "../stores/useThemeStore";

export enum ButtonType {
  PRIMARY,
  ERROR,
}

type AppButtonProps = ButtonProps & {
  variant?: ButtonType;
};

export default function AppButton({
  labelStyle,
  contentStyle,
  variant = ButtonType.PRIMARY,
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
      ]}
      labelStyle={[
        {
          fontSize: 28,
        },
        variantLabelStyle,
        labelStyle,
      ]}
      {...props}
    />
  );
}
