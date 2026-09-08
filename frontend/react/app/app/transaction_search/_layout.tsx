import { Stack } from "expo-router";
import { AppStack } from "../../components/AppStack";
import { useTranslation } from "../../i18n/helper";

export default function StackLayout() {
  const { t } = useTranslation();
  return (
    <AppStack bookScoped>
      <Stack.Screen name="list" options={{ title: t("Search Transactions") }} />
    </AppStack>
  );
}
