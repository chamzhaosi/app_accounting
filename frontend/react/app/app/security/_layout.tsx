import { Stack } from "expo-router";
import { AppStack } from "../../components/AppStack";
import { useTranslation } from "../../i18n/helper";

export default function StackLayout() {
  const { t } = useTranslation();
  return (
    <AppStack>
      <Stack.Screen
        name="local_authenticate"
        options={{
          title: t("Security"),
        }}
      />

      <Stack.Screen
        name="reset_password"
        options={{
          title: t("Reset Password"),
        }}
      />

      <Stack.Screen
        name="app_pin"
        options={{
          title: t("Set/ Change App PIN"),
        }}
      />
    </AppStack>
  );
}
