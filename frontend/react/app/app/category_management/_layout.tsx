import { Stack } from "expo-router";
import { AppStack } from "../../components/AppStack";
import { useTranslation } from "../../i18n/helper";

export default function StackLayout() {
  const { t } = useTranslation();
  return (
    <AppStack>
      <Stack.Screen
        name="list"
        options={{
          title: t("Category Management"),
        }}
      />

      <Stack.Screen
        name="create"
        options={{
          title: t("New Category"),
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          title: t("Category Detail"),
        }}
      />
    </AppStack>
  );
}
