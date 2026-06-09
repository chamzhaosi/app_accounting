import { forwardRef, useState } from "react";
import { FieldError } from "react-hook-form";
import { TextInput as RNTextInput, StyleSheet } from "react-native";
import { TextInput, TextInputProps } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";
import AppText, { TextTypEnum } from "./AppText";
import AppView from "./AppView";

type AppTextInputProps = TextInputProps & {
  isMaskValue?: boolean;
  onClearBtn?: () => void;
  errorField?: FieldError;
};

const AppTextInput = forwardRef<RNTextInput, AppTextInputProps>(
  (
    { isMaskValue = false, value, onClearBtn, errorField, maxLength, ...props },
    ref,
  ) => {
    const { THEME } = useThemeStore();
    const [showValue, setShowValue] = useState<boolean>(false);

    return (
      <AppView className="bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
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
          right={
            onClearBtn &&
            value?.length && (
              <TextInput.Icon icon="close" onPress={onClearBtn} />
            )
          }
          value={value}
          error={!!errorField?.message}
          maxLength={maxLength}
          {...props}
        />

        <AppView className="flex-row ms-auto bg-inherit dark:bg-inherit">
          {errorField?.message && (
            <AppText className="flex-1" type={TextTypEnum.ERROR}>
              {errorField.message}
            </AppText>
          )}
          {maxLength && (
            <AppText variant="labelLarge" className="mt-1">
              {value?.length ?? 0}/{maxLength}
            </AppText>
          )}
        </AppView>
      </AppView>
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
