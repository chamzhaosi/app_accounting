import { Stack } from "expo-router";
import { AppStack } from "../../../components/AppStack";
import { useTranslation } from "../../../i18n/helper";
import HeaderWithBookLabel from "../_components/HeaderWithBookLabel";

export const unstable_settings = {
  initialRouteName: "list",
};

export default function AccountsStackLayout() {
  const { t } = useTranslation();
  return (
    <AppStack initialRouteName="list" bookScoped>
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
          headerTitle: () => (
            <HeaderWithBookLabel
              title={"Account Detail"}
              textStyle={{ fontSize: 20 }}
            />
          ),
        }}
      />
    </AppStack>
  );
}
