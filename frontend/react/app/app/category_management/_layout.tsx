import { Stack } from "expo-router";
import { AppStack } from "../../components/AppStack";

export default function StackLayout() {
  return (
    <AppStack>
      <Stack.Screen
        name="list"
        options={{
          title: "Category Management",
        }}
      />

      <Stack.Screen
        name="create"
        options={{
          title: "New Category",
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          title: "Category Detail",
        }}
      />
    </AppStack>
  );
}
