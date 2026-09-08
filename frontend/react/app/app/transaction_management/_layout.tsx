import { Stack } from "expo-router";
import { AppStack } from "../../components/AppStack";
import { useTranslation } from "../../i18n/helper";
import HeaderWithBookLabel from "../(home)/_components/HeaderWithBookLabel";

export default function StackLayout() {
  const { t } = useTranslation();
  return (
    <AppStack bookScoped>
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
          headerTitle: () => (
            <HeaderWithBookLabel
              title="New Transaction"
              textStyle={{ fontSize: 20 }}
            />
          ),
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: () => (
            <HeaderWithBookLabel
              title={"Transaction Detail"}
              textStyle={{ fontSize: 20 }}
            />
          ),
        }}
      />
    </AppStack>
  );
}
