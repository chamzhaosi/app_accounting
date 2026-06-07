import { View, ViewProps } from "react-native";
import {
  SafeAreaView,
  SafeAreaViewProps,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { cn } from "../utils/common";

type AppViewProps = {
  isSafe?: boolean;
} & (ViewProps | SafeAreaViewProps);

export default function AppView({
  isSafe = false,
  className,
  ...props
}: AppViewProps) {
  const sharedClassName = "flex-1 bg-LIGHT-surface dark:bg-DARK-surface";

  if (!isSafe)
    return <View className={cn(sharedClassName, className)} {...props} />;

  return <SafeAreaView className={cn(sharedClassName, className)} {...props} />;
}
