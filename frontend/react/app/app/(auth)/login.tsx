import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import AppButton, { ButtonTypeEnum } from "../../components/AppButton";
import AppScrollView from "../../components/AppScrollView";
import AppSpacer from "../../components/AppSpacer";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import {
  loginFormDefaultValues,
  LoginFormType,
  loginSchema,
} from "../../forms/auth/schemas/login.schema";

export default function Loign() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: loginFormDefaultValues,
  });

  const onError = (errors: FieldErrors<LoginFormType>) => {
    const fieldName = Object.keys(errors)[0] as keyof LoginFormType;
    fieldName && setFocus(fieldName);
  };

  const onSubmit = async (data: LoginFormType) => {
    setRspErrorMsg("");
    console.log(data);
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsSubmitting(false);
    // setRspErrorMsg("Email or password is invalid. Please try again.");
    router.push("/(auth)/otp");
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
              SIGN IN
            </AppText>

            <AppSpacer />

            <Controller
              control={control}
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
                  submitBehavior="submit"
                  onSubmitEditing={() => setFocus("password")}
                />
              )}
            />

            {errors.email && (
              <AppText type={TextTypEnum.ERROR}>{errors.email.message}</AppText>
            )}

            <AppSpacer height={10} />

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
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  isMaskValue
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />
            {errors.password && (
              <AppText type={TextTypEnum.ERROR}>
                {errors.password.message}
              </AppText>
            )}

            <AppSpacer height={20} />

            <AppButton
              label="LOGIN"
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

            <AppView className="w-full justify-center items-center flex flex-row">
              <AppText className="text-md mr-2">
                Don't have an account yet?
              </AppText>
              <Link href={"/(auth)/register"}>
                <AppText className="font-semibold" type={TextTypEnum.LINK}>
                  Sign Up
                </AppText>
              </Link>
            </AppView>
          </AppView>
        </AppScrollView>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
