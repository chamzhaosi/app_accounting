import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { Keyboard } from "react-native";
import AppButton from "../../components/AppButton";
import AppScrollView from "../../components/AppScrollView";
import AppSpacer from "../../components/AppSpacer";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import {
  otpFormDefaultValues,
  OtpFormType,
  otpSchema,
} from "../../forms/auth/schemas/otp.schema";
import { useThemeStore } from "../../stores/useThemeStore";

export default function OTP() {
  const { THEME } = useThemeStore();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<OtpFormType>({
    resolver: zodResolver(otpSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: otpFormDefaultValues,
  });

  const onError = (errors: FieldErrors<OtpFormType>) => {
    const fieldName = Object.keys(errors)[0] as keyof OtpFormType;
    fieldName && setFocus(fieldName);
  };

  const onSubmit = async (data: OtpFormType) => {
    setRspErrorMsg("");
    console.log(data);
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsSubmitting(false);
    setRspErrorMsg("Invalid OTP. Please try again.");
  };

  return (
    <AppScrollView
      className="pt-8 rounded-t-[50] bg-LIGHT-surfaceContainerLow border-2 border-LIGHT-outlineVariant
                 dark:bg-DARK-surfaceContainerLow dark:border-DARK-outlineVariant"
    >
      <AppView isSafe className="w-[90%] self-center bg-inherit">
        <AppText variant="headlineLarge" style={{ color: THEME.secondary }}>
          VERIFICATION
        </AppText>

        <AppSpacer height={8} />
        <AppText>
          Please enter the verification code we send to your email address.
        </AppText>

        <AppSpacer height={8} />

        <Controller
          control={control}
          name="otp"
          render={({ field: { value, onChange, onBlur, ref } }) => (
            <AppTextInput
              ref={ref}
              mode="outlined"
              keyboardType="number-pad"
              label={"OTP"}
              placeholder="OTP"
              maxLength={6}
              autoFocus
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onSubmitEditing={handleSubmit(onSubmit, onError)}
            />
          )}
        />

        {errors.otp && (
          <AppText type={TextTypEnum.ERROR}>{errors.otp.message}</AppText>
        )}

        <AppSpacer height={20} />

        <AppButton
          onPress={() => {
            Keyboard.dismiss();
            handleSubmit(onSubmit, onError)();
          }}
          disabled={isSubmitting}
          loading={isSubmitting}
          uppercase
        >
          Verify
        </AppButton>
        {rspErrorMsg && (
          <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
        )}

        <AppSpacer height={20} />
      </AppView>
    </AppScrollView>
  );
}
