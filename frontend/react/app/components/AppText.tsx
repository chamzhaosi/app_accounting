import { Text, TextProps } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";
import { useTranslation } from "../i18n";

export enum TextTypEnum {
  ERROR = "error",
  LINK = "link",
  DEFAULT = "default",
}

type AppTextProps = {
  isTitle?: boolean;
  type?: TextTypEnum;
  shouldTranslateText?: boolean;
} & TextProps<string>;

export default function AppText({
  isTitle,
  style,
  type = TextTypEnum.DEFAULT,
  shouldTranslateText = true,
  ...props
}: AppTextProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();

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

  const children =
    shouldTranslateText &&
    type === TextTypEnum.ERROR &&
    typeof props.children === "string"
      ? t(props.children)
      : props.children;

  return (
    <Text
      variant="labelLarge"
      {...typeProps}
      {...(isTitle
        ? { variant: "displayLarge", style: { color: THEME.primary, ...style } }
        : {})}
      {...props}
    >
      {children}
    </Text>
  );
}
