import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AppScrollViewProps = KeyboardAwareScrollViewProps;

export default function AppScrollView({
  className,
  contentContainerStyle,
  extraScrollHeight,
  ...props
}: AppScrollViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAwareScrollView
      className={`flex-1 bg-blue-200 dark:bg-gray-800 ${className}`}
      enableOnAndroid
      extraScrollHeight={
        40 + insets.top + insets.bottom + (extraScrollHeight ?? 0)
      }
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        ...contentContainerStyle,
      }}
      {...props}
    />
  );
}
