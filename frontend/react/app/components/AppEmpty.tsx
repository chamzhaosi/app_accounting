import { useThemeStore } from "../stores/useThemeStore";
import AppIcon from "./AccIcon";
import AppText from "./AppText";
import AppView from "./AppView";

export default function AppEmpty() {
  const { THEME } = useThemeStore();

  return (
    <AppView className="flex-1 h-[350px] justify-center items-center">
      <AppIcon name="PackageOpen" size={100} color={THEME.onSurfaceDisabled} />
      <AppText
        variant="headlineMedium"
        style={{ color: THEME.onSurfaceDisabled }}
      >
        No Data
      </AppText>
    </AppView>
  );
}
