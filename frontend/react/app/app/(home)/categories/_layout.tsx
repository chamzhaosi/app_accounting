import { Stack } from "expo-router";
import { AppStack } from "../../../components/AppStack";
import { useTranslation } from "../../../i18n/helper";
import HeaderWithBookLabel from "../_components/HeaderWithBookLabel";

export default function CategoriesStackLayout() {
  const { t } = useTranslation();
  return (
    <AppStack initialRouteName="list" bookScoped>
      <Stack.Screen
        name="list"
        options={{ title: t("Categories"), headerShown: false }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: () => (
            <HeaderWithBookLabel
              title={"Category Detail"}
              textStyle={{ fontSize: 20 }}
            />
          ),
        }}
      />
    </AppStack>
  );
}
