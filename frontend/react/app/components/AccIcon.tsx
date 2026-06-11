import * as icons from "lucide-react-native/icons";
import { useThemeStore } from "../stores/useThemeStore";

export type AppIconProps = {
  name: keyof typeof icons;
  color?: string;
  size?: number;
};

export default function AppIcon({ name, color, size }: AppIconProps) {
  const { THEME } = useThemeStore();
  const LucideIcon = icons[name ?? "Box"];

  return <LucideIcon color={color ?? THEME.primary} size={size} />;
}
