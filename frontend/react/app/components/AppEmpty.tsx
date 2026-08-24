import { View } from "react-native";
import { useThemeStore } from "../stores/useThemeStore";
import AppIcon from "./AppIcon";
import AppText from "./AppText";
import { cn } from "../utils/className";
import { useTranslation } from "../i18n";

export default function AppEmpty({ className }: { className?: string }) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();

  return (
    <View className={cn("justify-center items-center my-4", className)}>
      <AppIcon name="PackageOpen" size={80} color={THEME.onSurfaceVariant} />
      <AppText
        variant="headlineSmall"
        style={{ color: THEME.onSurfaceVariant }}
      >
        {t("No Data")}
      </AppText>
    </View>
  );
}
