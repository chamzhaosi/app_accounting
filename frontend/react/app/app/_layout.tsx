import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import "../global.css";

export default function StackLayout() {
  const [loaded] = useFonts({
    ROBOTO_MONO: require("../assets/fonts/RobotoMono-VariableFont_wght.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ title: "Home" }} />
      </Stack>
    </>
  );
}
