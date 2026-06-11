import { Divider, DividerProps } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";

export default function AppDivider({ style, ...props }: DividerProps) {
  const { THEME } = useThemeStore();
  return (
    <Divider
      style={{ height: 1, backgroundColor: THEME.outline, ...style }}
      {...props}
    />
  );
}
