import { ActivityIndicator } from "react-native-paper";
import AppText from "../components/AppText";
import AppView from "../components/AppView";
import { DARK, LIGHT } from "../constants/colors";
import { useLoadingStore } from "../stores/useLoadingStore";
import { useThemeStore } from "../stores/useThemeStore";

export default function Landing() {
  const { THEME } = useThemeStore();
  const { isLoading } = useLoadingStore();

  return (
    <AppView className="relative bg-LIGHT-BG_PRIMARY dark:bg-DARK-BG_PRIMARY">
      <AppView isSafe className="justify-center items-center">
        <AppText isTitle className="text-7xl font-ROBOTO_MONO font-[600]">
          Finora
        </AppText>
        <AppText className="text-gray-800">Personal Accounting App</AppText>
      </AppView>
      {isLoading && (
        <AppView className="absolute inset-0 bg-LIGHT-BG_TRANSPARENT dark:bg-DARK-BG_TRANSPARENT items-center justify-center z-50 ">
          <ActivityIndicator size="large" color={THEME.TEXT_SECONDARY} />
        </AppView>
      )}
    </AppView>
  );
}
