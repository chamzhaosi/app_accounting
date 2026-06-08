import { FAB, FABProps } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore } from "../stores/useToastStore";

type AppFloatingButtonProps = FABProps;

export default function AppFloatingButton({
  style,
  ...props
}: AppFloatingButtonProps) {
  const insets = useSafeAreaInsets();
  const { isShow } = useToastStore();

  return (
    <FAB
      icon="plus"
      variant="primary"
      style={{
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0 + insets.bottom + (isShow ? 100 : 0),
        ...style,
      }}
      {...props}
    />
  );
}
