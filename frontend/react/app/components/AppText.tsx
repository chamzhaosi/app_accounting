import { Text, TextProps } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";

export enum TextTypEnum {
  ERROR = "error",
  LINK = "link",
  DEFAULT = "default",
}

type AppTextProps = {
  isTitle?: boolean;
  type?: TextTypEnum;
} & TextProps<string>;

export default function AppText({
  isTitle,
  style,
  type = TextTypEnum.DEFAULT,
  ...props
}: AppTextProps) {
  const { THEME } = useThemeStore();

  let typeProps: Omit<TextProps<string>, "children"> = {};

  switch (type) {
    case TextTypEnum.ERROR:
      typeProps = {
        style: { color: THEME.onErrorContainer, marginTop: 4, ...style },
      };
      break;
    case TextTypEnum.LINK:
      typeProps = {
        style: {
          color: THEME.onPrimaryContainer,
          textDecorationLine: "underline",
          ...style,
        },
      };
      break;
    default:
      typeProps = {
        style,
      };
      break;
  }

  return (
    <Text
      variant="labelLarge"
      {...typeProps}
      {...(isTitle
        ? { variant: "displayLarge", style: { color: THEME.primary, ...style } }
        : {})}
      {...props}
    />
  );
}
