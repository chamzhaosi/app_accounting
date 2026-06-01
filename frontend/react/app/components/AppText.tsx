import { Text, TextProps } from "react-native";
import { cn } from "../utils/common";

export enum TextTypEnum {
  ERROR = "error",
  LINK = "link",
  DEFAULT = "default",
}

type AppTextProps = {
  isTitle?: boolean;
  type?: TextTypEnum;
} & TextProps;

export default function AppText({
  isTitle,
  className,
  type = TextTypEnum.DEFAULT,
  ...props
}: AppTextProps) {
  const titleClassName = isTitle
    ? "text-3xl font-bold dark:text-DARK-TEXT_PRIMARY text-LIGHT-TEXT_PRIMARY"
    : "";

  let textClassName = "";

  switch (type) {
    case TextTypEnum.ERROR:
      textClassName =
        "text-LIGHT-TEXT_ERROR dark:text-DARK-TEXT_ERROR w-[90%] px-3 text-start font-semibold text-md";
      break;
    case TextTypEnum.LINK:
      textClassName = "text-blue-800 dark:text-DARK-TEXT_ACCENT underline";
      break;
    default:
      textClassName =
        "font-ROBOTO_MONO font-[600] text-LIGHT-TEXT_SECONDARY dark:text-DARK-TEXT_SECONDARY";
      break;
  }

  return (
    <Text
      className={cn(
        "text-xl",
        isTitle ? titleClassName : textClassName,
        className,
      )}
      {...props}
    />
  );
}
