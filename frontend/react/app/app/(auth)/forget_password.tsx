import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
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
import {
  forgetPasswordEmailFormDefaultValues,
  forgetPasswordEmailFormSchema,
  ForgetPasswordEmailFormType,
  forgetPasswordOTPFormDefaultValues,
  forgetPasswordOTPFormSchema,
  ForgetPasswordOTPFormType,
  forgetPasswordResetFormDefaultValues,
  forgetPasswordResetFormSchema,
  ForgetPasswordResetFormType,
} from "../../forms/schemas/auth/fortget_password.schema";
import { useThemeStore } from "../../stores/useThemeStore";

enum ForgetPasswordStepEnum {
  STEP_1_EMAIL = "EMAIL",
  STEP_2_OTP = "OPT",
  STEP_3_NEWPASSWORD = "NEWPASSWORD",
}

export default function ForgetPassword() {
  const { THEME } = useThemeStore();
  const [step, setStep] = useState<ForgetPasswordStepEnum>(
    ForgetPasswordStepEnum.STEP_1_EMAIL,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");

  // Step 1 - Email form
  const {
    control: emailControl,
    handleSubmit: emailHandleSubmit,
    formState: { errors: emailErrors },
  } = useForm<ForgetPasswordEmailFormType>({
    resolver: zodResolver(forgetPasswordEmailFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: forgetPasswordEmailFormDefaultValues,
  });

  const onSubmitEmail = async (data: ForgetPasswordEmailFormType) => {
    setRspErrorMsg("");
    console.log(data);
    setIsSubmitting(true);
    await new Promise((res) =>
      setTimeout(() => {
        res("success");
        otpSetValues({
          ...forgetPasswordOTPFormDefaultValues,
          email: data.email,
        });
        setStep(ForgetPasswordStepEnum.STEP_2_OTP);
      }, 2000),
    );
    setIsSubmitting(false);
    // setRspErrorMsg("Email or password is invalid. Please try again.");
  };

  // Step 2 - OTP form
  const {
    control: otpControl,
    setValues: otpSetValues,
    handleSubmit: otpHandleSubmit,
    formState: { errors: otpErrors },
  } = useForm<ForgetPasswordOTPFormType>({
    resolver: zodResolver(forgetPasswordOTPFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: forgetPasswordOTPFormDefaultValues,
  });

  const onSubmitOTP = async (data: ForgetPasswordOTPFormType) => {
    setRspErrorMsg("");
    console.log(data);
    setIsSubmitting(true);
    await new Promise((res) =>
      setTimeout(() => {
        res("success");
        resetPswSetValues({
          ...forgetPasswordResetFormSchema,
          email: data.email,
          resetToken: "this-is-a-unique-token-key",
        });
        setStep(ForgetPasswordStepEnum.STEP_3_NEWPASSWORD);
      }, 2000),
    );
    setIsSubmitting(false);
    // setRspErrorMsg("Email or password is invalid. Please try again.");
  };

  // Step 3 - Reset Password Form
  const {
    control: resetPswControl,
    handleSubmit: resetPswHandleSubmit,
    setValues: resetPswSetValues,
    setFocus: resetPswSetFocus,
    formState: { errors: resetPswErrors },
  } = useForm<ForgetPasswordResetFormType>({
    resolver: zodResolver(forgetPasswordResetFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: forgetPasswordResetFormDefaultValues,
  });

  const onSubmitResetPsw = async (data: ForgetPasswordResetFormType) => {
    setRspErrorMsg("");
    console.log(data);
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsSubmitting(false);
    // setRspErrorMsg("Email or password is invalid. Please try again.");
  };

  const isFormError =
    Object.keys(emailErrors).length > 0 ||
    Object.keys(otpErrors).length > 0 ||
    Object.keys(resetPswErrors).length > 0;

  const { title, description, btnLabel, handleSubmit } = useMemo(() => {
    switch (step) {
      case ForgetPasswordStepEnum.STEP_1_EMAIL:
        return {
          title: "FORGOT PASSWORD",
          description:
            "Enter your registered email address to receive a verification code.",
          btnLabel: "SUBMIT",
          handleSubmit: emailHandleSubmit(onSubmitEmail),
        };
      case ForgetPasswordStepEnum.STEP_2_OTP:
        return {
          title: "VERIFICATION",
          description: "Enter the verification code we sent to your email.",
          btnLabel: "VERIFY",
          handleSubmit: otpHandleSubmit(onSubmitOTP),
        };
      case ForgetPasswordStepEnum.STEP_3_NEWPASSWORD:
        return {
          title: "RESET PASSWORD",
          description: "Create a new password for your account.",
          btnLabel: "RESET PASSWORD",
          handleSubmit: resetPswHandleSubmit(onSubmitResetPsw),
        };
      default:
        return { handleSubmit: undefined };
    }
  }, [step]);

  return (
    <AppScrollView className="pt-8 rounded-t-[50]">
      <AppView className="w-[90%] self-center bg-inherit dark:bg-inherit">
        <AppText variant="headlineLarge" style={{ color: THEME.secondary }}>
          {title}
        </AppText>

        <AppSpacer height={8} />
        <AppText>{description}</AppText>

        <AppSpacer height={8} />

        {step === ForgetPasswordStepEnum.STEP_1_EMAIL && (
          <Controller
            control={emailControl}
            name="email"
            render={({ field: { value, onChange, onBlur, ref } }) => (
              <AppTextInput
                ref={ref}
                mode="outlined"
                label={"Email"}
                autoFocus
                editable={!isSubmitting}
                placeholder="Email"
                keyboardType="email-address"
                autoComplete="email"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                onSubmitEditing={handleSubmit}
                errorField={emailErrors.email}
              />
            )}
          />
        )}

        {step === ForgetPasswordStepEnum.STEP_2_OTP && (
          <Controller
            control={otpControl}
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
                onSubmitEditing={handleSubmit}
                errorField={otpErrors.otp}
              />
            )}
          />
        )}

        {step === ForgetPasswordStepEnum.STEP_3_NEWPASSWORD && (
          <>
            <Controller
              control={resetPswControl}
              name="password"
              render={({ field: { value, onChange, onBlur, ref } }) => (
                <AppTextInput
                  ref={ref}
                  mode="outlined"
                  placeholder="Password"
                  label={"Password"}
                  editable={!isSubmitting}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  submitBehavior="submit"
                  isMaskValue
                  onSubmitEditing={() => resetPswSetFocus("cfmPassword")}
                  errorField={resetPswErrors.password}
                />
              )}
            />
            <AppSpacer height={10} />
            <Controller
              control={resetPswControl}
              name="cfmPassword"
              render={({ field: { value, onChange, onBlur, ref } }) => (
                <AppTextInput
                  ref={ref}
                  mode="outlined"
                  placeholder="Confirm Password"
                  label={"Confirm Password"}
                  editable={!isSubmitting}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  isMaskValue
                  onSubmitEditing={handleSubmit}
                  errorField={resetPswErrors.cfmPassword}
                />
              )}
            />
          </>
        )}

        <AppSpacer height={20} />

        <AppButton
          onPress={() => {
            !isFormError && Keyboard.dismiss();
            handleSubmit?.();
          }}
          disabled={isSubmitting}
          loading={isSubmitting}
          uppercase
          {...AUTH_SUBMIT_BTN_CONTENT_STYLE}
        >
          {btnLabel}
        </AppButton>
        {rspErrorMsg && (
          <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
        )}
      </AppView>
    </AppScrollView>
  );
}
