import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { Keyboard } from "react-native";
import AppButton, {
  AUTH_SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppScrollView from "../../components/AppScrollView";
import AppSpacer from "../../components/AppSpacer";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import {
  otpFormDefaultValues,
  OtpFormType,
  otpSchema,
} from "../../forms/schemas/auth/otp.schema";
import { useThemeStore } from "../../stores/useThemeStore";

import {
  appPinLoginFormDefaultValues,
  AppPinLoginFormType,
  appPinLoginSchema,
} from "../../forms/schemas/auth/app_pin_login.schema";
import { APP_PIN_HASH_KEY, getStoredItem } from "../../local/secureStore";
import { checkPin } from "../../local/auth";
import { router } from "expo-router";

export default function AppPINLogin() {
  const { THEME } = useThemeStore();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AppPinLoginFormType>({
    resolver: zodResolver(appPinLoginSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: appPinLoginFormDefaultValues,
  });

  const onSubmit = async (data: AppPinLoginFormType) => {
    try {
      setIsSubmitting(true);
      const isValid = await checkPin(data.pin);
      if (!isValid) setErrorMsg("Incorrect PIN");
      else router.dismissTo("/(home)/dashboard");
    } catch (e) {
      console.error("Error when checking app pin hash", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormError = Object.keys(errors).length > 0;

  return (
    <AppScrollView className="pt-8 rounded-t-[50]">
      <AppView className="w-[90%] self-center bg-inherit dark:bg-inherit">
        <AppText variant="headlineLarge" style={{ color: THEME.secondary }}>
          APP PIN
        </AppText>

        <AppSpacer height={8} />
        <AppText>Enter your app PIN to continue.</AppText>

        <AppSpacer height={8} />

        <Controller
          control={control}
          name="pin"
          render={({ field: { value, onChange, onBlur, ref } }) => (
            <AppTextInput
              ref={ref}
              mode="outlined"
              keyboardType="number-pad"
              label={"PIN"}
              placeholder="PIN"
              maxLength={6}
              autoFocus
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              isMaskValue
              onSubmitEditing={handleSubmit(onSubmit)}
              errorField={errors.pin}
            />
          )}
        />

        <AppSpacer height={20} />

        <AppButton
          onPress={() => {
            !isFormError && Keyboard.dismiss();
            handleSubmit(onSubmit)();
          }}
          disabled={isSubmitting}
          loading={isSubmitting}
          uppercase
          {...AUTH_SUBMIT_BTN_CONTENT_STYLE}
        >
          Login
        </AppButton>
        {errorMsg && <AppText type={TextTypEnum.ERROR}>{errorMsg}</AppText>}
      </AppView>
    </AppScrollView>
  );
}
