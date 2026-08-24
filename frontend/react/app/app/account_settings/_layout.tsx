import { Stack } from "expo-router";
import { AppStack } from "../../components/AppStack";
import { useTranslation } from "../../i18n";

export default function StackLayout() {
  const { t } = useTranslation();

  return (
    <AppStack>
      <Stack.Screen name="index" options={{ title: t("Account Settings") }} />
    </AppStack>
  );
}
