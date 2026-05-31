import { View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "../utils/common";

type AppViewProps = {
  isSafe?: boolean;
} & ViewProps;

export default function AppView({
  isSafe = false,
  className,
  ...props
}: AppViewProps) {
  if (!isSafe) return <View className={className} {...props} />;

  const insets = useSafeAreaInsets();
  return (
    <View
      {...props}
      style={{ marginTop: insets.top, marginBottom: insets.bottom }}
      className={cn("flex-1", className)}
    />
  );
}
