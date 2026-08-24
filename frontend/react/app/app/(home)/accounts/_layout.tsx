import { Stack } from "expo-router";
import { AppStack } from "../../../components/AppStack";
import { useTranslation } from "../../../i18n";

export default function AccountsStackLayout() {
  const { t } = useTranslation();
  return (
    <AppStack initialRouteName="list">
      <Stack.Screen
        name="list"
        options={{
          title: t("Accounts"),
          headerShown: false,
        }}
      />
      <Stack.Screen name="[id]" options={{ title: t("Account Detail") }} />
    </AppStack>
  );
}
