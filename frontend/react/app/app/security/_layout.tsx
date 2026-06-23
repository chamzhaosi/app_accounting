import { Stack } from "expo-router";
import { AppStack } from "../../components/AppStack";

export default function StackLayout() {
  return (
    <AppStack>
      <Stack.Screen
        name="local_authenticate"
        options={{
          title: "Security",
        }}
      />

      <Stack.Screen
        name="reset_password"
        options={{
          title: "Reset Password",
        }}
      />

      <Stack.Screen
        name="app_pin"
        options={{
          title: "Set/ Change App PIN",
        }}
      />
    </AppStack>
  );
}
