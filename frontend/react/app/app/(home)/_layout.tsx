import { Tabs } from "expo-router";
import { Gauge, Settings } from "lucide-react-native";
import { FONTS } from "../../constants/fonts";
import { useThemeStore } from "../../stores/useThemeStore";

export default function StackLayout() {
  const { THEME } = useThemeStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveBackgroundColor: THEME.TAB_ACTIVE_BG,
        tabBarInactiveBackgroundColor: THEME.TAB_INACTIVE_BG,
        tabBarActiveTintColor: THEME.TAB_ACTIVE_TINT,
        tabBarInactiveTintColor: THEME.TAB_INACTIVE_TINT,
        tabBarLabelStyle: { fontFamily: FONTS.ROBOTO_MONO },
        headerTitleStyle: {
          fontFamily: FONTS.ROBOTO_MONO,
        },
        headerStyle: {
          backgroundColor: THEME.BG_PRIMARY,
        },
        headerTintColor: THEME.TEXT_PRIMARY,
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
        name="setting"
        options={{
          title: "Setting",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
