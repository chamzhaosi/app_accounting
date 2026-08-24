import { Stack } from "expo-router";
import { AppStack } from "../../components/AppStack";
import { useTranslation } from "../../i18n";

export default function StackLayout() {
  const { t } = useTranslation();
  return (
    <AppStack>
      <Stack.Screen
        name="list"
        options={{
          title: t("Transaction Management"),
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="create"
        options={{
          title: t("New Transaction"),
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          title: t("Transaction Detail"),
        }}
      />
    </AppStack>
  );
}
