import { Divider, DividerProps } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";

export default function AppDivider({ style, ...props }: DividerProps) {
  const { THEME } = useThemeStore();
  return (
    <Divider style={{ backgroundColor: THEME.outline, ...style }} {...props} />
  );
}
