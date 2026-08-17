import { Stack } from "expo-router";
import { AppStack } from "../../../components/AppStack";

export default function CategoriesStackLayout() {
  return (
    <AppStack initialRouteName="list">
      <Stack.Screen
        name="list"
        options={{ title: "Categories", headerShown: false }}
      />
      <Stack.Screen name="[id]" options={{ title: "Category Detail" }} />
    </AppStack>
  );
}
