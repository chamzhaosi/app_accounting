import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";

import { useEffect } from "react";
import { FONTS, FONTS_THEME } from "../constants/fonts";
import "../global.css";
import { useLoadingStore } from "../stores/useLoadingStore";
import { ThemeType, useThemeStore } from "../stores/useThemeStore";
import { useColorScheme } from "react-native";
import Toast from "react-native-toast-message";
import { toastConfig } from "../config/toastConfig";

import {
  MD3LightTheme as DefaultLightTheme,
  MD3DarkTheme as DefaultDarkTheme,
  PaperProvider,
} from "react-native-paper";
import { DARK, LIGHT } from "../constants/colors";

import { StatusBar } from "expo-status-bar";

export default function StackLayout() {
  const colorScheme = useColorScheme() as ThemeType;
  const { startLoading, stopLoading } = useLoadingStore();
  const { isDark, THEME, toggleTheme } = useThemeStore();
  const baseTheme = isDark ? DefaultDarkTheme : DefaultLightTheme;

  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...(isDark ? DARK : LIGHT),
    },
    fonts: {
      ...baseTheme.fonts,
      ...FONTS_THEME(baseTheme),
    },
  };

  const [loaded] = useFonts({
    [FONTS.ROBOTO]: require("../assets/fonts/Roboto-VariableFont_wdth,wght.ttf"),
    [FONTS.ADLAM_DISPLAY]: require("../assets/fonts/ADLaMDisplay-Regular.ttf"),
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
    <PaperProvider theme={theme}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerTitleStyle: {
            fontFamily: FONTS.ADLAM_DISPLAY,
          },
          headerStyle: {
            backgroundColor: THEME.surface,
          },
          headerTintColor: THEME.onSurface,
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
    </PaperProvider>
  );
}
