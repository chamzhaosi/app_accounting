import { forwardRef } from "react";
import { FieldError } from "react-hook-form";
import { TextInput as RNTextInput, StyleSheet, View } from "react-native";
import { TextInput, TextInputProps } from "react-native-paper";
import { TEXTINPUT_FONTSIZE, TEXTINPUT_HEIGHT } from "../constants/size";
import { useThemeStore } from "../stores/useThemeStore";
import { toBigAmount } from "../utils/amount";
import AppText, { TextTypEnum } from "./AppText";
import { useTranslation } from "../i18n/helper";

type AppTextInputProps = TextInputProps & {
  errorField?: FieldError;
  showClear?: boolean;
  continerClassName?: string;
  fixedDecimalInput?: boolean;
  fixedDecimalPlaces?: number;
};

const getZeroValue = (decimalPlaces: number) =>
  decimalPlaces > 0 ? `0.${"0".repeat(decimalPlaces)}` : "0";

const formatFixedDecimalInput = (value: string, decimalPlaces: number) => {
  const digits = value.replace(/\D/g, "");
  return toBigAmount(digits)
    .div(10 ** decimalPlaces)
    .toFixed(decimalPlaces);
};

const formatAmountOnBlur = (
  value: string | undefined,
  decimalPlaces: number,
) => {
  try {
    return toBigAmount(value).toFixed(decimalPlaces);
  } catch {
    return getZeroValue(decimalPlaces);
  }
};

const isNonZeroAmount = (value?: string) => {
  try {
    return !toBigAmount(value).eq(0);
  } catch {
    return false;
  }
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
      fixedDecimalPlaces = 2,
      caretHidden,
      selection,
      label,
      placeholder,
      disabled,
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
            !disabled &&
            showClear &&
            value?.length &&
            (!fixedDecimalInput || isNonZeroAmount(value)) && (
              <TextInput.Icon
                icon="close"
                onPress={() =>
                  onChangeText?.(
                    fixedDecimalInput ? getZeroValue(fixedDecimalPlaces) : "",
                  )
                }
              />
            )
          }
          label={typeof label === "string" ? t(label) : label}
          placeholder={t(placeholder ?? "Please enter")}
          value={value}
          disabled={disabled}
          error={!!errorField?.message}
          maxLength={maxLength}
          onBlur={(e) => {
            onChangeText?.(formatAmountOnBlur(value, fixedDecimalPlaces));
            onBlur?.(e);
          }}
          onChangeText={(text) =>
            onChangeText?.(
              fixedDecimalInput
                ? formatFixedDecimalInput(text, fixedDecimalPlaces)
                : text,
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
