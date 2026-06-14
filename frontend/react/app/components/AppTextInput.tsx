import { forwardRef, useState } from "react";
import { FieldError } from "react-hook-form";
import { TextInput as RNTextInput, StyleSheet } from "react-native";
import { TextInput, TextInputProps } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";
import AppText, { TextTypEnum } from "./AppText";
import AppView from "./AppView";
import { TEXTINPUT_FONTSIZE, TEXTINPUT_HEIGHT } from "../constants/size";

type AppTextInputProps = TextInputProps & {
  isMaskValue?: boolean;
  errorField?: FieldError;
  showClear?: boolean;
};

const AppTextInput = forwardRef<RNTextInput, AppTextInputProps>(
  (
    {
      isMaskValue = false,
      value,
      showClear = false,
      errorField,
      maxLength,
      onChangeText,
      style,
      numberOfLines,
      multiline,
      ...props
    },
    ref,
  ) => {
    const { THEME } = useThemeStore();
    const [showValue, setShowValue] = useState<boolean>(false);

    return (
      <>
        <TextInput
          ref={ref}
          style={[
            defaultStyle.container,
            {
              backgroundColor: THEME.surfaceContainerHigh,
              height: multiline
                ? TEXTINPUT_HEIGHT * ((numberOfLines ?? 1) - 1)
                : TEXTINPUT_HEIGHT,
              ...style,
            },
          ]}
          {...(isMaskValue
            ? {
                secureTextEntry: !showValue,
                setShowValue,
              }
            : {})}
          right={
            isMaskValue ? (
              <TextInput.Icon
                color={THEME.onSurface}
                icon={showValue ? "eye-off" : "eye"}
                onPressIn={() => setShowValue(true)}
                onPressOut={() => setShowValue(false)}
                forceTextInputFocus={false}
              />
            ) : (
              showClear &&
              value?.length && (
                <TextInput.Icon
                  icon="close"
                  onPress={() => onChangeText?.("")}
                />
              )
            )
          }
          placeholder="Please enter"
          value={value}
          error={!!errorField?.message}
          maxLength={maxLength}
          onChangeText={onChangeText}
          numberOfLines={numberOfLines}
          multiline={multiline}
          {...props}
        />

        <AppView className="flex-0 flex-row ms-auto bg-inherit dark:bg-inherit">
          {errorField?.message && (
            <AppText className="flex-1" type={TextTypEnum.ERROR}>
              {errorField.message}
            </AppText>
          )}
          {maxLength && (
            <AppText variant="labelLarge" className="mt-1 ms-auto">
              {value?.length ?? 0}/{maxLength}
            </AppText>
          )}
        </AppView>
      </>
    );
  },
);

AppTextInput.displayName = "AppTextInput";

export default AppTextInput;

const defaultStyle = StyleSheet.create({
  container: {
    fontSize: TEXTINPUT_FONTSIZE,
  },
});
