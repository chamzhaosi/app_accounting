import { ActivityIndicator } from "react-native-paper";
import AppText from "../components/AppText";
import AppView from "../components/AppView";
import { useLoadingStore } from "../stores/useLoadingStore";
import { View } from "react-native";

export default function Landing() {
  const { isLoading } = useLoadingStore();

  return (
    <AppView isSafe className="relative justify-center items-center">
      <View>
        <AppText isTitle>Finora</AppText>
        <AppText variant="labelLarge">Personal Accounting App</AppText>
      </View>
      {isLoading && (
        <View className="absolute inset-0 items-center justify-center z-50 bg-LIGHT-surfaceContainerHighest/50 dark:bg-DARK-surfaceContainerHighest/60">
          <ActivityIndicator size="large" />
        </View>
      )}
    </AppView>
  );
}
