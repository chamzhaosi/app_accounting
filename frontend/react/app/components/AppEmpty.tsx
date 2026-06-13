import { View } from "react-native";
import { useThemeStore } from "../stores/useThemeStore";
import AppIcon from "./AccIcon";
import AppText from "./AppText";
import { cn } from "../utils/common";

export default function AppEmpty({ className }: { className?: string }) {
  const { THEME } = useThemeStore();

  return (
    <View className={cn("justify-center items-center my-4", className)}>
      <AppIcon name="PackageOpen" size={80} color={THEME.onSurfaceVariant} />
      <AppText
        variant="headlineSmall"
        style={{ color: THEME.onSurfaceVariant }}
      >
        No Data
      </AppText>
    </View>
  );
}
