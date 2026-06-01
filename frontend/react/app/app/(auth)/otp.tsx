import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import AppButton, { ButtonTypeEnum } from "../../components/AppButton";
import AppScrollView from "../../components/AppScrollView";
import AppSpacer from "../../components/AppSpacer";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppView from "../../components/AppView";
import {
  otpFormDefaultValues,
  OtpFormType,
  otpSchema,
} from "../../forms/auth/schemas/otp.schema";
import AppTextInput from "../../components/AppTextInput";

export default function OTP() {
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView className="flex-1 bg-LIGHT-BG_PRIMARY dark:bg-DARK-BG_PRIMARY">
        <AppView
          isSafe
          className="flex-grow-[0.25] w-full justify-center items-center m-0 "
        >
          <AppText isTitle className="text-7xl font-ROBOTO_MONO font-[600]">
            Finora
          </AppText>
          <AppText className="text-gray-800">Personal Accounting App</AppText>
        </AppView>
        <AppScrollView
          className="pt-8 rounded-t-[50]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 1,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <AppView isSafe className="w-[90%] self-center">
            <AppText isTitle className="text-[2rem] text-start w-[90%] ms-4">
              VERIFICATION
            </AppText>

            <AppSpacer height={8} />
            <AppText className="text-md mx-4">
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
              label="VERIFY"
              labelClassName="text-LIGHT-TEXT_ACCENT dark:text-DARK-TEXT_SECONDARY font-ROBOTO_MONO font-light"
              type={ButtonTypeEnum.PRIMARY}
              disabled={isSubmitting}
              isLoading={isSubmitting}
              onPress={() => {
                Keyboard.dismiss();
                handleSubmit(onSubmit, onError)();
              }}
            />
            {rspErrorMsg && (
              <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
            )}

            <AppSpacer height={20} />
          </AppView>
        </AppScrollView>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
