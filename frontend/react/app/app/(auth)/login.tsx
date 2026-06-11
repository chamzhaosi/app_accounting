import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
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
  loginFormDefaultValues,
  LoginFormType,
  loginSchema,
} from "../../forms/auth/schemas/login.schema";
import { useThemeStore } from "../../stores/useThemeStore";

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
    <AppScrollView className="pt-8 rounded-t-[50]">
      <AppView isSafe className="w-[90%] self-center bg-inherit">
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
          <AppText type={TextTypEnum.ERROR}>{errors.password.message}</AppText>
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
          LOGIN
        </AppButton>
        {rspErrorMsg && (
          <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
        )}

        <AppSpacer height={20} />

        <AppView className="flex-0 w-full justify-center items-center flex flex-row">
          <AppText>{"Don't have an account yet?"}</AppText>
          <Link href={"/(auth)/register"} style={{ marginStart: 4 }}>
            <AppText type={TextTypEnum.LINK}>{"Sign Up"}</AppText>
          </Link>
        </AppView>
      </AppView>
    </AppScrollView>
  );
}
