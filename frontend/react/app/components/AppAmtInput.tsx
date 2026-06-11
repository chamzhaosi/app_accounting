import { forwardRef } from "react";
import { FieldError } from "react-hook-form";
import { TextInput as RNTextInput, StyleSheet } from "react-native";
import { TextInput, TextInputProps } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";
import AppView from "./AppView";
import { TEXTINPUT_FONTSIZE, TEXTINPUT_HEIGHT } from "../constants/common";
import AppText, { TextTypEnum } from "./AppText";

type AppTextInputProps = TextInputProps & {
  errorField?: FieldError;
  showClear?: boolean;
};

const AppAmtInput = forwardRef<RNTextInput, AppTextInputProps>(
  (
    {
      value,
      errorField,
      onChangeText,
      onBlur,
      maxLength,
      showClear = false,
      ...props
    },
    ref,
  ) => {
    const { THEME } = useThemeStore();
    return (
      <>
        <TextInput
          ref={ref}
          style={[
            defaultStyle.container,
            {
              backgroundColor: THEME.surfaceContainerHigh,
            },
          ]}
          right={
            showClear &&
            value?.length && (
              <TextInput.Icon icon="close" onPress={() => onChangeText?.("")} />
            )
          }
          placeholder="Please enter"
          value={value}
          error={!!errorField?.message}
          maxLength={maxLength}
          onBlur={(e) => {
            const num = Number(value);
            onChangeText?.(isNaN(num) ? "0.00" : num.toFixed(2));
            onBlur?.(e);
          }}
          onChangeText={onChangeText}
          {...props}
        />

        <AppView className="flex-0 flex-row ms-auto bg-inherit dark:bg-inherit">
          {errorField?.message && (
            <AppText className="flex-1" type={TextTypEnum.ERROR}>
              {errorField.message}
            </AppText>
          )}
        </AppView>
      </>
    );
  },
);

AppAmtInput.displayName = "AppAmtInput";

export default AppAmtInput;

const defaultStyle = StyleSheet.create({
  container: {
    height: TEXTINPUT_HEIGHT,
    fontSize: TEXTINPUT_FONTSIZE,
  },
});
