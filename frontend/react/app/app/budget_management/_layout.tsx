import { Stack } from "expo-router";
import { AppStack } from "../../components/AppStack";

export default function StackLayout() {
  return (
    <AppStack>
      <Stack.Screen name="manage" options={{ title: "Budget Management" }} />
    </AppStack>
  );
}
