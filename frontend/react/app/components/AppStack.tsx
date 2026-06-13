// components/AppStack.tsx
import { Stack } from "expo-router";
import { useThemeStore } from "../stores/useThemeStore";
import { FONTS } from "../constants/fonts";

type AppStackProps = React.ComponentProps<typeof Stack>;

export function AppStack({ ...props }: AppStackProps) {
  const { THEME } = useThemeStore();

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: {
          fontFamily: FONTS.ADLAM_DISPLAY,
          fontSize: 20,
        },
        headerStyle: {
          backgroundColor: THEME.surfaceContainerLow,
        },
        headerTintColor: THEME.primary,
      }}
      {...props}
    />
  );
}
