import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="login"
          options={{ title: "Login", headerShown: false }}
        />
        <Stack.Screen
          name="register"
          options={{ title: "Register", headerShown: false }}
        />
        <Stack.Screen
          name="otp"
          options={{ title: "OTP", headerShown: false }}
        />
      </Stack>
    </>
  );
}
