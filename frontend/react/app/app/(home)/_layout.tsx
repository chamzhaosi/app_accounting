import { Tabs } from "expo-router";
import { Gauge, Settings } from "lucide-react-native";
import { FONTS } from "../../constants/fonts";
import { useThemeStore } from "../../stores/useThemeStore";

export default function StackLayout() {
  const { THEME } = useThemeStore();

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
