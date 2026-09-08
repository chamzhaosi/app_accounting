import { Stack } from "expo-router";
import { AppStack } from "../../components/AppStack";
import { useTranslation } from "../../i18n/helper";

export default function BookManagementLayout() {
  const { t } = useTranslation();
  return (
    <AppStack>
      <Stack.Screen name="list" options={{ title: t("Book Management") }} />
      <Stack.Screen name="create" options={{ title: t("New Book") }} />
      <Stack.Screen name="[id]" options={{ title: t("Book Detail") }} />
    </AppStack>
  );
}
