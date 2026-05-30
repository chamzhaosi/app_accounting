import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function StackLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen
          name="login"
          options={{ title: "Login", headerShown: false }}
        />
      </Stack>
    </>
  );
}
