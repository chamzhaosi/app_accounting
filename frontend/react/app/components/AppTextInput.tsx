import { forwardRef, useState } from "react";
import { TextInput, TextInputProps } from "react-native-paper";
import { TextInput as RNTextInput, useColorScheme } from "react-native";
import { DARK, LIGHT } from "../constants/colors";
import { FONTS } from "../constants/fonts";
import { useThemeStore } from "../stores/useThemeStore";

type AppTextInputProps = TextInputProps & {
  isMaskValue?: boolean;
};

const AppTextInput = forwardRef<RNTextInput, AppTextInputProps>(
  ({ isMaskValue = false, ...props }, ref) => {
    const { THEME } = useThemeStore();

    const [showPassword, setShowPassword] = useState(false);

    return (
      <TextInput
        ref={ref}
        style={{
          height: 60,
          fontSize: 18,
          backgroundColor: THEME.surfaceContainerHigh,
        }}
        {...(isMaskValue
          ? {
              secureTextEntry: !showPassword,
              right: (
                <TextInput.Icon
                  color={THEME.onSurface}
                  icon={showPassword ? "eye-off" : "eye"}
                  onPressIn={() => setShowPassword(true)}
                  onPressOut={() => setShowPassword(false)}
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
