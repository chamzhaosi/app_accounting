import { useFonts } from "expo-font";
import { Stack } from "expo-router";

import { QueryClientProvider } from "@tanstack/react-query";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import Toast from "react-native-toast-message";
import { toastConfig } from "../config/toastConfig";
import { FONTS, FONTS_THEME } from "../constants/fonts";
import "../global.css";
import { useLoadingStore } from "../stores/useLoadingStore";
import { useAmountPrivacyStore } from "../stores/useAmountPrivacyStore";
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
import { queryClient } from "../config/queryClient";
import { DARK, LIGHT } from "../constants/colors";
import { initDB } from "../sql/db/database";
import { useToastStore } from "../stores/useToastStore";
import { useLanguageStore } from "../stores/useLanguageStore";
import { useReportingCurrencyStore } from "../stores/useReportingCurrencyStore";
import { DEBUG_TAG, debugLog } from "../utils/debugLog";
import { useTranslation } from "../i18n/helper";

export default function StackLayout() {
  const { setShowToast, setHideToast } = useToastStore();
  const insets = useSafeAreaInsets() ?? {
    insets: { top: 0, bottom: 0, right: 0, left: 0 },
  };
  const colorScheme = useColorScheme() as ThemeType;
  const { isDark, THEME, toggleTheme } = useThemeStore() ?? { THEME: LIGHT };
  const { startLoading, stopLoading } = useLoadingStore();
  const hydrateAmountPrivacy = useAmountPrivacyStore((state) => state.hydrate);
  const hydrateLanguage = useLanguageStore((state) => state.hydrate);
  const isLanguageHydrated = useLanguageStore((state) => state.isHydrated);
  const hydrateReportingCurrency = useReportingCurrencyStore(
    (state) => state.hydrate,
  );
  const isReportingCurrencyHydrated = useReportingCurrencyStore(
    (state) => state.isHydrated,
  );
  const { t } = useTranslation();
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

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
    let isMounted = true;

    debugLog(DEBUG_TAG.APP, "Bootstrapping application");
    void initDB()
      .then(() => {
        if (isMounted) setIsDatabaseReady(true);
      })
      .catch((error) => {
        console.error(
          DEBUG_TAG.APP,
          "Application startup stopped because the database is not ready",
          error,
        );
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    toggleTheme(colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    void hydrateAmountPrivacy();
  }, [hydrateAmountPrivacy]);

  useEffect(() => {
    void hydrateLanguage();
  }, [hydrateLanguage]);

  useEffect(() => {
    void hydrateReportingCurrency();
  }, [hydrateReportingCurrency]);

  useEffect(() => {
    if (
      !loaded ||
      !isDatabaseReady ||
      !isLanguageHydrated ||
      !isReportingCurrencyHydrated ||
      isAppReady
    )
      return;

    debugLog(DEBUG_TAG.APP, "Database and assets ready; starting application");
    setIsAppReady(true);
  }, [
    isAppReady,
    isDatabaseReady,
    isLanguageHydrated,
    isReportingCurrencyHydrated,
    loaded,
  ]);

  if (!isAppReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <StatusBar style="auto" />
          <AppStack>
            <Stack.Screen name="landing" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(home)" options={{ headerShown: false }} />
            <Stack.Screen
              name="category_detail/[id]"
              options={{ title: t("Category Detail") }}
            />
            <Stack.Screen
              name="account_type"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="account_management"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="category_management"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="budget_management"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="security" options={{ headerShown: false }} />
            <Stack.Screen
              name="account_settings"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="currency_management"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="transaction_management"
              options={{ headerShown: false }}
            />
          </AppStack>
          <Toast
            config={toastConfig(THEME, insets)}
            onShow={setShowToast}
            onHide={setHideToast}
          />
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
