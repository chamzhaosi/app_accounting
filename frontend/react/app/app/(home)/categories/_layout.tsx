import { Stack } from "expo-router";
import { AppStack } from "../../../components/AppStack";
import { useTranslation } from "../../../i18n/helper";

export default function CategoriesStackLayout() {
  const { t } = useTranslation();
  return (
    <AppStack initialRouteName="list">
      <Stack.Screen
        name="list"
        options={{ title: t("Categories"), headerShown: false }}
      />
      <Stack.Screen name="[id]" options={{ title: t("Category Detail") }} />
    </AppStack>
  );
}
