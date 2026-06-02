import { View } from "react-native";
import { cn } from "../utils/common";

export default function AppDivider({ className }: { className?: string }) {
  return (
    <View
      className={cn(
        "my-4 border-LIGHT-BG_SECONDARY dark:border-DARK-BG_ACCENT border-b-2",
        className,
      )}
    />
  );
}
