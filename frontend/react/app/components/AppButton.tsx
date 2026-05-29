import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  View,
} from "react-native";
import AppText from "./AppText";

export enum ButtonTypeEnum {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  WARNING = "warning",
  DANGER = "danger",
}

type AppButtonProps = PressableProps & {
  label: string;
  labelClassName?: string;
  isLoading?: boolean;
  type?: ButtonTypeEnum;
};

export default function AppButton({
  className,
  label,
  labelClassName,
  type = ButtonTypeEnum.PRIMARY,
  isLoading,
  ...props
}: AppButtonProps) {
  let btnColor;

  switch (type) {
    case ButtonTypeEnum.SECONDARY:
      btnColor = "bg-green-400 dark:bg-green-700";
      break;
    case ButtonTypeEnum.WARNING:
      btnColor = "bg-yellow-400 dark:bg-yellow-700";
      break;
    case ButtonTypeEnum.DANGER:
      btnColor = "bg-red-400 dark:bg-red-700";
      break;
    default:
      btnColor = "bg-blue-500 dark:bg-blue-700";
      break;
  }

  return (
    <Pressable
      className={`py-3 rounded-lg w-[90%] items-center active:opacity-80
         ${btnColor} ${isLoading && "disabled:opacity-60"} 
         ${className}`}
      {...props}
    >
      <View className="flex-row gap-4">
        {isLoading && (
          <ActivityIndicator className="scale-150 text-gray-700 dark:text-slate-300" />
        )}
        <AppText className={`text-3xl ${labelClassName}`}>{label}</AppText>
      </View>
    </Pressable>
  );
}
