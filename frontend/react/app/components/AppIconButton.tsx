import { Pressable, PressableProps, StyleSheet } from "react-native";
import AppIcon, { AppIconProps } from "./AppIcon";
import { useThemeStore } from "../stores/useThemeStore";

type AppIconButton = PressableProps & {
  iconName: AppIconProps["name"];
};

export default function AppIconButton({
  iconName,
  style,
  ...props
}: AppIconButton) {
  const { THEME } = useThemeStore();
  return (
    <Pressable
      {...props}
      style={[
        defaultStyle.container,
        {
          backgroundColor: THEME.surfaceContainerLow,
          ...style,
        },
      ]}
    >
      <AppIcon name={iconName} />
    </Pressable>
  );
}

const defaultStyle = StyleSheet.create({
  container: {
    borderRadius: 4,
  },
});
