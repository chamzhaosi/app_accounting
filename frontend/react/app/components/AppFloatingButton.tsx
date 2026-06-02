import { Plus } from "lucide-react-native";
import { Pressable } from "react-native";
import { cn } from "../utils/common";
import { useThemeStore } from "../stores/useThemeStore";

type AppFloatingButtonProps = {
  className?: string;
  onPress: () => void;
};

export default function AppFloatingButton({
  className,
  onPress,
}: AppFloatingButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "absolute right-10 bottom-24 w-14 h-14 rounded-full bg-LIGHT-BTN_SECONDARY dark:bg-DARK-BTN_SECONDARY items-center justify-center shadow-lg",
        className,
      )}
    >
      <Plus color="white" size={28} />
    </Pressable>
  );
}
