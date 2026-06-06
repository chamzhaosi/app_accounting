import { ActivityIndicator } from "react-native-paper";
import AppText from "../components/AppText";
import AppView from "../components/AppView";
import { useLoadingStore } from "../stores/useLoadingStore";

export default function Landing() {
  const { isLoading } = useLoadingStore();

  return (
    <AppView className="relative">
      <AppView isSafe className="justify-center items-center">
        <AppText isTitle>Finora</AppText>
        <AppText variant="labelLarge">Personal Accounting App</AppText>
      </AppView>
      {isLoading && (
        <AppView className="absolute inset-0 items-center justify-center z-50 bg-LIGHT-surfaceContainerHighest/50 dark:bg-DARK-surfaceContainerHighest/60">
          <ActivityIndicator size="large" />
        </AppView>
      )}
    </AppView>
  );
}
