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
    ? "text-3xl font-bold dark:text-slate-200 text-lightTextPrimary"
    : "";

  let textClassName = "";

  switch (type) {
    case TextTypEnum.ERROR:
      textClassName =
        "text-lightTextError dark:text-red-500 w-[90%] px-3 text-start font-semibold text-md";
      break;
    case TextTypEnum.LINK:
      textClassName = "text-blue-800 underline";
      break;
    default:
      textClassName =
        "font-robotoMono font-[600] text-lightTextSecondary dark:text-slate-300";
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
