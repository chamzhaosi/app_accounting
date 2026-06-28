import { useFonts } from "expo-font";
import { Stack } from "expo-router";

import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import Toast from "react-native-toast-message";
import { toastConfig } from "../config/toastConfig";
import { FONTS, FONTS_THEME } from "../constants/fonts";
import "../global.css";
import { useLoadingStore } from "../stores/useLoadingStore";
import { ThemeType, useThemeStore } from "../stores/useThemeStore";

import { StatusBar } from "expo-status-bar";
import {
  MD3DarkTheme as DefaultDarkTheme,
  MD3LightTheme as DefaultLightTheme,
  PaperProvider,
} from "react-native-paper";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AppStack } from "../components/AppStack";
import { DARK, LIGHT } from "../constants/colors";
import { initDB } from "../sql/db/database";
import { useToastStore } from "../stores/useToastStore";

export default function StackLayout() {
  const { setShowToast, setHideToast } = useToastStore();
  const insets = useSafeAreaInsets() ?? {
    insets: { top: 0, bottom: 0, right: 0, left: 0 },
  };
  const colorScheme = useColorScheme() as ThemeType;
  const { isDark, THEME, toggleTheme } = useThemeStore() ?? { THEME: LIGHT };
  const { startLoading, stopLoading } = useLoadingStore();

  const baseTheme = isDark ? DefaultDarkTheme : DefaultLightTheme;
  SystemUI.setBackgroundColorAsync(THEME.surface);

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
    initDB();
    toggleTheme(colorScheme);
  }, [colorScheme]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="auto" />
        <AppStack>
          <Stack.Screen name="landing" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(home)" options={{ headerShown: false }} />
          <Stack.Screen name="account_type" options={{ headerShown: false }} />
          <Stack.Screen
            name="account_management"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="category_management"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="security" options={{ headerShown: false }} />
        </AppStack>
        <Toast
          config={toastConfig(THEME, insets)}
          onShow={setShowToast}
          onHide={setHideToast}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
