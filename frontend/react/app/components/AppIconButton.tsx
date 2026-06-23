import { Pressable, PressableProps, StyleSheet } from "react-native";
import AppIcon, { AppIconProps } from "./AppIcon";
import { useThemeStore } from "../stores/useThemeStore";

type AppIconButton = PressableProps & {
  iconName: AppIconProps["name"];
  iconSize?: number;
};

export default function AppIconButton({
  iconName,
  style,
  iconSize,
  disabled,
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
      disabled={disabled}
    >
      <AppIcon
        name={iconName}
        size={iconSize}
        color={disabled ? THEME.surfaceDisabled : THEME.primary}
      />
    </Pressable>
  );
}

const defaultStyle = StyleSheet.create({
  container: {
    borderRadius: 4,
  },
});
