import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { FONTS } from "../constants/fonts";
import "../global.css";
import { useLoadingStore } from "../stores/useLoadingStore";
import { ThemeType, useThemeStore } from "../stores/useThemeStore";
import { useColorScheme } from "react-native";
import Toast from "react-native-toast-message";
import { toastConfig } from "../config/toastConfig";
import { LIGHT } from "../constants/colors";

export default function StackLayout() {
  const colorScheme = useColorScheme() as ThemeType;

  const { startLoading, stopLoading } = useLoadingStore();
  const { THEME, toggleTheme } = useThemeStore();

  const [loaded] = useFonts({
    [FONTS.ROBOTO_MONO]: require("../assets/fonts/RobotoMono-VariableFont_wght.ttf"),
  });

  useEffect(() => {
    toggleTheme(colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    if (!loaded) return;
    userAuthChecking();
  }, [loaded]);

  const userAuthChecking = async () => {
    startLoading();
    await new Promise((res) => setTimeout(res, 2000));
    stopLoading();
    // router.replace("/(auth)/login");
    // router.push("/(home)/dashboard");
  };

  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerTitleStyle: {
            fontFamily: FONTS.ROBOTO_MONO,
          },
          headerStyle: {
            backgroundColor: THEME.BG_PRIMARY,
          },
          headerTintColor: THEME.TEXT_PRIMARY,
        }}
      >
        {/* <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} /> */}
        {/* <Stack.Screen name="(home)" options={{ headerShown: false }} /> */}
        <Stack.Screen
          name="account_type/list"
          options={{
            title: "Account Types",
          }}
        />

        <Stack.Screen
          name="account_type/create"
          options={{
            title: "Add new account type",
          }}
        />

        {/* <Stack.Screen
          name="account_type/[id]"
          options={{
            title: "Account Type Detail",
          }}
        /> */}
      </Stack>
      <Toast config={toastConfig(THEME ?? LIGHT)} />
    </>
  );
}
