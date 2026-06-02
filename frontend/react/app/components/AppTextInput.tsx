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
    const { isDark, THEME } = useThemeStore();

    const [showPassword, setShowPassword] = useState(false);

    return (
      <TextInput
        ref={ref}
        contentStyle={{
          color: isDark ? DARK.TEXT_PRIMARY : "",
          fontFamily: FONTS.ROBOTO_MONO,
          fontWeight: 400,
        }}
        style={{
          backgroundColor: THEME.BG_ACCENT,
        }}
        textColor={isDark ? DARK.TEXT_PRIMARY : ""}
        activeOutlineColor={THEME.TEXT_PRIMARY}
        autoCorrect={false}
        autoCapitalize={"none"}
        theme={{
          colors: {
            onSurfaceVariant: isDark ? DARK.TEXT_PRIMARY : "",
          },
        }}
        {...(isMaskValue
          ? {
              secureTextEntry: !showPassword,
              right: (
                <TextInput.Icon
                  color={isDark ? DARK.TEXT_PRIMARY : ""}
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
