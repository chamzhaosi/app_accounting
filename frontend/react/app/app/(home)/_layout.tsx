import { Tabs, useSegments } from "expo-router";
import {
  Gauge,
  HandCoins,
  Settings,
  Tags,
  WalletCards,
} from "lucide-react-native";
import { FONTS } from "../../constants/fonts";
import { useThemeStore } from "../../stores/useThemeStore";

export default function StackLayout() {
  const { THEME } = useThemeStore();
  const segments = useSegments();
  const activeSegments = segments as readonly string[];
  const isAccountsList =
    activeSegments[1] === "accounts" &&
    (activeSegments[2] === undefined || activeSegments[2] === "list");
  const isCategoriesList =
    activeSegments[1] === "categories" &&
    (activeSegments[2] === undefined || activeSegments[2] === "list");

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
        name="categories"
        options={{
          title: "Categories",
          headerShown: isCategoriesList,
          tabBarIcon: ({ color, size }) => <Tags color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <HandCoins color={color} size={size} />
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
      <Tabs.Screen
        name="_components/DailyTransactionChart"
        options={{
          href: null,
          tabBarItemStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="_components/DashboardSummaryCarousel"
        options={{
          href: null,
          tabBarItemStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
