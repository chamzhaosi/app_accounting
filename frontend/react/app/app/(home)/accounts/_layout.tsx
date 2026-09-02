import { router, Stack } from "expo-router";
import { IconButton } from "react-native-paper";
import { AppStack } from "../../../components/AppStack";
import { useTranslation } from "../../../i18n/helper";
import { useThemeStore } from "../../../stores/useThemeStore";

export const unstable_settings = {
  initialRouteName: "list",
};

export default function AccountsStackLayout() {
  const { t } = useTranslation();
  const { THEME } = useThemeStore();

  const returnToAccounts = () => {
    router.replace("/(home)/accounts/list");
  };
  return (
    <AppStack initialRouteName="list">
      <Stack.Screen
        name="list"
        options={{
          title: t("Accounts"),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: t("Account Detail"),
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              iconColor={THEME.primary}
              accessibilityLabel={t("Back to accounts")}
              onPress={returnToAccounts}
            />
          ),
        }}
      />
    </AppStack>
  );
}
