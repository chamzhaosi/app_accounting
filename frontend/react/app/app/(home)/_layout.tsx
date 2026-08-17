import { Tabs, useSegments } from "expo-router";
import { Gauge, Settings, WalletCards } from "lucide-react-native";
import { FONTS } from "../../constants/fonts";
import { useThemeStore } from "../../stores/useThemeStore";

export default function StackLayout() {
  const { THEME } = useThemeStore();
  const segments = useSegments();
  const isAccountsList =
    segments[1] === "accounts" &&
    (segments[2] === undefined || segments[2] === "list");

  return (
    <Tabs
      screenOptions={{
        tabBarActiveBackgroundColor: THEME.primary,
        tabBarInactiveBackgroundColor: THEME.surfaceContainer,
        tabBarActiveTintColor: THEME.onPrimary,
        tabBarInactiveTintColor: THEME.onSurface,
        tabBarLabelStyle: { fontFamily: FONTS.ROBOTO },
        headerTitleStyle: {
          fontFamily: FONTS.ADLAM_DISPLAY,
          fontSize: 28,
        },
        headerStyle: {
          backgroundColor: THEME.surfaceContainerHigh,
        },
        headerTintColor: THEME.primary,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Gauge color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: "Accounts",
          headerShown: isAccountsList,
          tabBarIcon: ({ color, size }) => (
            <WalletCards color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "Setting",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="_components/AccountBalanceSummary"
        options={{
          href: null,
          tabBarItemStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
