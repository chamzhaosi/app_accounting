import { Stack } from "expo-router";
import { AppStack } from "../../components/AppStack";

export default function StackLayout() {
  return (
    <AppStack>
      <Stack.Screen
        name="list"
        options={{
          title: "Account Management",
        }}
      />

      <Stack.Screen
        name="create"
        options={{
          title: "New Account",
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          title: "Account Detail",
        }}
      />
    </AppStack>
  );
}
