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
  if (!isSafe)
    return (
      <View
        className={cn(
          "flex-1 bg-LIGHT-BG_PRIMARY dark:bg-DARK-BG_PRIMARY",
          className,
        )}
        {...props}
      />
    );

  const insets = useSafeAreaInsets();
  return (
    <View
      {...props}
      style={{ marginTop: insets.top, marginBottom: insets.bottom }}
      className={cn(
        "flex-1 bg-LIGHT-BG_PRIMARY dark:bg-DARK-BG_PRIMARY",
        className,
      )}
    />
  );
}
