import { Stack } from "expo-router";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import AppText from "../../components/AppText";
import AppView from "../../components/AppView";
import { useThemeStore } from "../../stores/useThemeStore";
import { useTranslation } from "../../i18n/helper";

export default function StackLayout() {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView isSafe edges={["top", "left", "right"]}>
        <View className="flex-grow-[0.20] w-full justify-center items-center m-0">
          <AppText isTitle>Finora</AppText>
          <AppText variant="labelLarge">{t("Personal Accounting App")}</AppText>
        </View>
        <Stack
          screenOptions={{ contentStyle: { backgroundColor: THEME.surface } }}
        >
          <Stack.Screen
            name="login"
            options={{ title: t("Login"), headerShown: false }}
          />
          <Stack.Screen
            name="app_pin_login"
            options={{ title: t("App PIN Login"), headerShown: false }}
          />
          <Stack.Screen
            name="register"
            options={{ title: t("Register"), headerShown: false }}
          />
          <Stack.Screen
            name="otp"
            options={{ title: t("OTP"), headerShown: false }}
          />
          <Stack.Screen
            name="forget_password"
            options={{ title: t("Forget Password"), headerShown: false }}
          />
        </Stack>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
