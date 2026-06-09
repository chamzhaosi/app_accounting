import * as icons from "lucide-react-native/icons";

export type AppIconProps = {
  name: keyof typeof icons;
  color?: string;
  size?: number;
};

export default function AppIcon({ name, color, size }: AppIconProps) {
  const LucideIcon = icons[name ?? "Box"];

  return <LucideIcon color={color} size={size} />;
}
