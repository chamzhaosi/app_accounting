import { forwardRef } from "react";
import { FieldError } from "react-hook-form";
import { TextInput as RNTextInput, StyleSheet, View } from "react-native";
import { TextInput, TextInputProps } from "react-native-paper";
import { TEXTINPUT_FONTSIZE, TEXTINPUT_HEIGHT } from "../constants/size";
import { useThemeStore } from "../stores/useThemeStore";
import AppText, { TextTypEnum } from "./AppText";
import { useTranslation } from "../i18n";

type AppTextInputProps = TextInputProps & {
  errorField?: FieldError;
  showClear?: boolean;
  continerClassName?: string;
  fixedDecimalInput?: boolean;
};

const formatFixedDecimalInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return (Number(digits || 0) / 100).toFixed(2);
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
      style,
      continerClassName,
      fixedDecimalInput = false,
      caretHidden,
      selection,
      label,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const { THEME } = useThemeStore();
    const { t } = useTranslation();
    return (
      <View className={continerClassName}>
        <TextInput
          ref={ref}
          style={[
            defaultStyle.container,
            {
              backgroundColor: THEME.surfaceContainerHigh,
            },
            style,
          ]}
          right={
            showClear &&
            value?.length &&
            (!fixedDecimalInput || Number(value) !== 0) && (
              <TextInput.Icon
                icon="close"
                onPress={() => onChangeText?.(fixedDecimalInput ? "0.00" : "")}
              />
            )
          }
          label={typeof label === "string" ? t(label) : label}
          placeholder={t(placeholder ?? "Please enter")}
          value={value}
          error={!!errorField?.message}
          maxLength={maxLength}
          onBlur={(e) => {
            const num = Number(value);
            onChangeText?.(isNaN(num) ? "0.00" : num.toFixed(2));
            onBlur?.(e);
          }}
          onChangeText={(text) =>
            onChangeText?.(
              fixedDecimalInput ? formatFixedDecimalInput(text) : text,
            )
          }
          caretHidden={fixedDecimalInput || caretHidden}
          selection={
            fixedDecimalInput
              ? { start: value?.length ?? 0, end: value?.length ?? 0 }
              : selection
          }
          {...props}
        />

        <View className="flex-row ms-auto bg-inherit dark:bg-inherit">
          {errorField?.message && (
            <AppText className="flex-1" type={TextTypEnum.ERROR}>
              {t(errorField.message)}
            </AppText>
          )}
        </View>
      </View>
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
