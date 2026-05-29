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
    ? "text-3xl font-bold dark:text-slate-200 text-blue-800"
    : "";

  let textClassName = "";

  switch (type) {
    case TextTypEnum.ERROR:
      textClassName = "text-red-600 dark:text-red-500 w-[90%] px-3 text-start";
      break;
    case TextTypEnum.LINK:
      textClassName = "text-blue-800";
      break;
    default:
      textClassName = "dark:text-slate-300";
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
