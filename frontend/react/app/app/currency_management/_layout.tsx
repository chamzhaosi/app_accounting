import { Stack } from "expo-router";
import { AppStack } from "../../components/AppStack";
import HeaderWithBookLabel from "../(home)/_components/HeaderWithBookLabel";

export default function StackLayout() {
  return (
    <AppStack>
      <Stack.Screen
        name="list"
        options={{
          headerTitle: () => (
            <HeaderWithBookLabel
              title="Currency Management"
              textStyle={{ fontSize: 20 }}
            />
          ),
        }}
      />
    </AppStack>
  );
}
