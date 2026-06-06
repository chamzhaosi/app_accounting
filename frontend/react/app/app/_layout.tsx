import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";

import { useEffect } from "react";
import { FONTS, FONTS_THEME } from "../constants/fonts";
import "../global.css";
import { useLoadingStore } from "../stores/useLoadingStore";
import { useColorScheme } from "react-native";
import {
  MD3LightTheme as DefaultLightTheme,
  MD3DarkTheme as DefaultDarkTheme,
  PaperProvider,
} from "react-native-paper";
import { DARK, LIGHT } from "../constants/colors";
import { ThemeType, useThemeStore } from "../stores/useThemeStore";
import { StatusBar } from "expo-status-bar";

export default function StackLayout() {
  const colorScheme = useColorScheme() as ThemeType;
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

  const { startLoading, stopLoading } = useLoadingStore();

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
    router.push("/(auth)/login");
  };

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
