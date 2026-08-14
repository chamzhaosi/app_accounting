import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard } from "react-native";
import AppButton, {
  AUTH_SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppScrollView from "../../components/AppScrollView";
import AppSpacer from "../../components/AppSpacer";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import { useThemeStore } from "../../stores/useThemeStore";

import dayjs from "dayjs";
import { router } from "expo-router";
import {
  appPinLoginFormDefaultValues,
  AppPinLoginFormType,
  appPinLoginSchema,
} from "../../forms/schemas/auth/app_pin_login.schema";
import { checkPin } from "../../local/auth";
import {
  AUTH_ERROR_RESET_MINUTES,
  MAX_AUTH_ATTEMPTS,
  useLocalAuthStore,
} from "../../stores/useLocalAuthStore";
import { DASHBOARD_URL, LANDING_URL } from "../../constants/urls";
import { getDB } from "../../sql/db/database";

export default function AppPINLogin() {
  const { THEME } = useThemeStore();
  const {
    authErrorCounter,
    lastErrorAuthDateTime,
    setAuthErrorCounter,
    setLastErrorAuthDateTime,
  } = useLocalAuthStore();

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
      setErrorMsg("");
      setIsSubmitting(true);
      const isValid = await checkPin(data.pin);
      if (!isValid) {
        setErrorMsg("Incorrect PIN");
        let errorCounter = authErrorCounter;

        if (lastErrorAuthDateTime) {
          const minutesSinceLastError = dayjs().diff(
            lastErrorAuthDateTime,
            "minute",
          );

          if (minutesSinceLastError >= AUTH_ERROR_RESET_MINUTES) {
            errorCounter = 0;
          }
        }

        errorCounter += 1;
        setAuthErrorCounter(errorCounter);
        setLastErrorAuthDateTime(dayjs());

        if (errorCounter >= MAX_AUTH_ATTEMPTS) {
          router.dismissTo(LANDING_URL);
          return;
        }
      } else {
        authErrorCounter && setAuthErrorCounter(0);
        lastErrorAuthDateTime && setLastErrorAuthDateTime(null);
        router.dismissTo(DASHBOARD_URL);
      }
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
