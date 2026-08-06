import { Stack } from "expo-router";
import { AppStack } from "../../components/AppStack";

export default function StackLayout() {
  return (
    <AppStack>
      {/* <Stack.Screen
        name="list"
        options={{
          title: "Transaction Management",
          headerShown: false,
        }}
      /> */}

      <Stack.Screen
        name="create"
        options={{
          title: "New Transaction",
        }}
      />

      {/* <Stack.Screen
        name="[id]"
        options={{
          title: "Transaction Detail",
        }}
      /> */}
    </AppStack>
  );
}
