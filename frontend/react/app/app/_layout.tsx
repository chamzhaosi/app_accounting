import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";

import { useEffect } from "react";
import { useColorScheme } from "react-native";
import Toast from "react-native-toast-message";
import { toastConfig } from "../config/toastConfig";
import { FONTS, FONTS_THEME } from "../constants/fonts";
import "../global.css";
import { useLoadingStore } from "../stores/useLoadingStore";
import { ThemeType, useThemeStore } from "../stores/useThemeStore";
import * as SystemUI from "expo-system-ui";

import {
  Appbar,
  MD3DarkTheme as DefaultDarkTheme,
  MD3LightTheme as DefaultLightTheme,
  PaperProvider,
} from "react-native-paper";
import { DARK, LIGHT } from "../constants/colors";

import { StatusBar } from "expo-status-bar";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
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
    router.push("/(home)/dashboard");
  };

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerTitleStyle: {
              fontFamily: FONTS.ADLAM_DISPLAY,
              fontSize: 20,
            },
            headerStyle: {
              backgroundColor: THEME.surfaceContainerLow,
            },
            headerTintColor: THEME.primary,
          }}
        >
          <Stack.Screen name="landing" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(home)" options={{ headerShown: false }} />
          <Stack.Screen
            name="account_type/list"
            options={{
              title: "Account Types",
            }}
          />

          <Stack.Screen
            name="account_type/create"
            options={{
              title: "New Account Type",
            }}
          />

          <Stack.Screen
            name="account_type/[id]"
            options={{
              title: "Account Type Detail",
            }}
          />

          <Stack.Screen
            name="account_management/list"
            options={{
              title: "Account Management",
            }}
          />

          <Stack.Screen
            name="account_management/create"
            options={{
              title: "New Account",
            }}
          />

          <Stack.Screen
            name="account_management/[id]"
            options={{
              title: "Account Detail",
            }}
          />
        </Stack>
        <Toast
          config={toastConfig(THEME, insets)}
          onShow={setShowToast}
          onHide={setHideToast}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
