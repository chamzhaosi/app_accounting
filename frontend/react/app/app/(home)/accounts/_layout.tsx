import { Stack } from "expo-router";
import { AppStack } from "../../../components/AppStack";

export default function AccountsStackLayout() {
  return (
    <AppStack initialRouteName="list">
      <Stack.Screen
        name="list"
        options={{
          title: "Accounts",
          headerShown: false,
        }}
      />
      <Stack.Screen name="[id]" options={{ title: "Account Detail" }} />
    </AppStack>
  );
}
