import { Controller, useForm } from "react-hook-form";
import {
  resetPasswordFormDefaultValues,
  resetPasswordFormSchema,
  ResetPasswordFormType,
} from "../forms/schemas/reset_password.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import AppView from "../components/AppView";
import AppTextInput from "../components/AppTextInput";
import AppButton, {
  AUTH_SUBMIT_BTN_CONTENT_STYLE,
} from "../components/AppButton";
import AppText, { TextTypEnum } from "../components/AppText";
import AppSpacer from "../components/AppSpacer";

export default function ResetPassword() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");

  const {
    control,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<ResetPasswordFormType>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: resetPasswordFormDefaultValues,
  });

  const onSubmit = async (data: ResetPasswordFormType) => {
    setRspErrorMsg("");
    console.log(data);
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsSubmitting(false);
    // setRspErrorMsg("Email or password is invalid. Please try again.");
  };

  const isFormError = Object.keys(errors).length > 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView className="p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
        <AppText>{"Create a new password for your account."}</AppText>
        <AppSpacer height={8} />
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur, ref } }) => (
            <AppTextInput
              ref={ref}
              mode="outlined"
              placeholder="Password"
              label={"Password"}
              editable={!isSubmitting}
              disabled={isSubmitting}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              submitBehavior="submit"
              isMaskValue
              onSubmitEditing={() => setFocus("cfmPassword")}
              errorField={errors.password}
            />
          )}
        />
        <AppSpacer height={12} />
        <Controller
          control={control}
          name="cfmPassword"
          render={({ field: { value, onChange, onBlur, ref } }) => (
            <AppTextInput
              ref={ref}
              mode="outlined"
              placeholder="Confirm Password"
              label={"Confirm Password"}
              editable={!isSubmitting}
              disabled={isSubmitting}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              isMaskValue
              onSubmitEditing={handleSubmit(onSubmit)}
              errorField={errors.cfmPassword}
            />
          )}
        />
        <AppSpacer />
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
          Change Password
        </AppButton>
        {rspErrorMsg && (
          <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
        )}
      </AppView>
    </TouchableWithoutFeedback>
  );
}
