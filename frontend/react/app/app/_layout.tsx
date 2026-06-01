import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { FONTS } from "../constants/fonts";
import "../global.css";
import { useLoadingStore } from "../stores/useLoadingStore";

export default function StackLayout() {
  const { startLoading, stopLoading } = useLoadingStore();

  const [loaded] = useFonts({
    [FONTS.ROBOTO_MONO]: require("../assets/fonts/RobotoMono-VariableFont_wght.ttf"),
  });

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
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
