import { View } from "react-native";
import { useThemeStore } from "../stores/useThemeStore";
import AppIcon from "./AccIcon";
import AppText from "./AppText";

export default function AppEmpty() {
  const { THEME } = useThemeStore();

  return (
    <View className="h-[300px] justify-center items-center">
      <AppIcon name="PackageOpen" size={80} color={THEME.onSurfaceDisabled} />
      <AppText
        variant="headlineSmall"
        style={{ color: THEME.onSurfaceDisabled }}
      >
        No Data
      </AppText>
    </View>
  );
}
