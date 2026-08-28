import { Stack } from "expo-router";
import { AppStack } from "../../components/AppStack";
import { useTranslation } from "../../i18n/helper";

export default function StackLayout() {
  const { t } = useTranslation();
  return (
    <AppStack>
      <Stack.Screen name="list" options={{ title: t("Budget Management") }} />
      <Stack.Screen name="create" options={{ title: t("Create Budget") }} />
      <Stack.Screen name="[id]" options={{ title: t("Edit Budget") }} />
      <Stack.Screen name="manage" options={{ title: t("Create Budget") }} />
    </AppStack>
  );
}
