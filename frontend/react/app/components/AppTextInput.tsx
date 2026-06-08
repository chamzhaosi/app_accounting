import { forwardRef, useState } from "react";
import { TextInput, TextInputProps } from "react-native-paper";
import {
  TextInput as RNTextInput,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { DARK, LIGHT } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { useThemeStore } from "../stores/useThemeStore";

type AppTextInputProps = TextInputProps & {
  isMaskValue?: boolean;
};

const AppTextInput = forwardRef<RNTextInput, AppTextInputProps>(
  ({ isMaskValue = false, ...props }, ref) => {
    const { THEME } = useThemeStore();

    const [showValue, setShowValue] = useState<boolean>(false);

    return (
      <TextInput
        ref={ref}
        style={[
          defaultStyle.container,
          {
            backgroundColor: THEME.surfaceContainerHigh,
          },
        ]}
        {...(isMaskValue
          ? {
              secureTextEntry: !showValue,
              setShowValue,
              right: (
                <TextInput.Icon
                  color={THEME.onSurface}
                  icon={showValue ? "eye-off" : "eye"}
                  onPressIn={() => setShowValue(true)}
                  onPressOut={() => setShowValue(false)}
                  forceTextInputFocus={false}
                />
              ),
            }
          : {})}
        {...props}
      />
    );
  },
);

AppTextInput.displayName = "AppTextInput";

export default AppTextInput;

const defaultStyle = StyleSheet.create({
  container: {
    height: 54,
    fontSize: 18,
  },
});
