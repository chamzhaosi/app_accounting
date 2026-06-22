import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { Keyboard, View } from "react-native";
import AppButton, {
  AUTH_SUBMIT_BTN_CONTENT_STYLE,
  ButtonType,
} from "../../components/AppButton";
import AppScrollView from "../../components/AppScrollView";
import AppSpacer from "../../components/AppSpacer";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import {
  loginFormDefaultValues,
  LoginFormType,
  loginSchema,
} from "../../forms/schemas/auth/login.schema";
import { useThemeStore } from "../../stores/useThemeStore";
import { OTP_URL } from "../../constants/urls";

export default function Loign() {
  const { THEME } = useThemeStore();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
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
    router.push(OTP_URL);
  };

  const isFormError = Object.keys(errors).length > 0;

  return (
    <AppScrollView className="pt-8 rounded-t-[50]">
      <AppView className="w-[90%] self-center bg-inherit dark:bg-inherit">
        <AppText variant="headlineLarge" style={{ color: THEME.secondary }}>
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
              errorField={errors.email}
            />
          )}
        />

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
              errorField={errors.password}
            />
          )}
        />

        <Link href={"/(auth)/forget_password"} style={{ marginBlock: 12 }}>
          <AppText style={{ color: THEME.outline }}>
            {"Forget Your Password?"}
          </AppText>
        </Link>

        <AppButton
          onPress={() => {
            !isFormError && Keyboard.dismiss();
            handleSubmit(onSubmit, onError)();
          }}
          variant={ButtonType.PRIMARY}
          disabled={isSubmitting}
          loading={isSubmitting}
          uppercase
          {...AUTH_SUBMIT_BTN_CONTENT_STYLE}
        >
          LOGIN
        </AppButton>
        {rspErrorMsg && (
          <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
        )}

        <AppSpacer height={20} />

        <View className="w-full justify-center items-center flex flex-row">
          <AppText>{"Don't have an account yet?"}</AppText>
          <Link href={"/(auth)/register"} style={{ marginStart: 8 }}>
            <AppText type={TextTypEnum.LINK}>{"Sign Up"}</AppText>
          </Link>
        </View>
      </AppView>
    </AppScrollView>
  );
}
