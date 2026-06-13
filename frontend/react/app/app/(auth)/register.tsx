import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TextInput, View } from "react-native";
import AppButton from "../../components/AppButton";
import AppScrollView from "../../components/AppScrollView";
import AppSpacer from "../../components/AppSpacer";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import {
  registerFormDefaultValues,
  RegisterFormType,
  registerSchema,
} from "../../forms/schemas/auth/register.schema";
import { useThemeStore } from "../../stores/useThemeStore";

export default function Register() {
  const { THEME } = useThemeStore();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const cfmPasswordRef = useRef<TextInput>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");

  const {
    control,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<RegisterFormType>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: registerFormDefaultValues,
  });

  const loginSubmitter = async (data: RegisterFormType) => {
    setRspErrorMsg("");
    console.log(data);
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsSubmitting(false);
    setRspErrorMsg("Email has beed resgister");
  };

  return (
    <AppScrollView className="pt-8 rounded-t-[50]">
      <AppView className="w-[90%] self-center bg-inherit">
        <AppText variant="headlineLarge" style={{ color: THEME.secondary }}>
          SIGN UP
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
              submitBehavior="submit"
              isMaskValue
              onSubmitEditing={() => setFocus("cfmPassword")}
            />
          )}
        />
        {errors.password && (
          <AppText type={TextTypEnum.ERROR}>{errors.password.message}</AppText>
        )}

        <AppSpacer height={10} />

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
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              isMaskValue
              onSubmitEditing={handleSubmit(loginSubmitter)}
            />
          )}
        />
        {errors.cfmPassword && (
          <AppText type={TextTypEnum.ERROR}>
            {errors.cfmPassword.message}
          </AppText>
        )}

        <AppSpacer height={20} />

        <AppButton
          onPress={() => {
            Keyboard.dismiss();
            handleSubmit(loginSubmitter)();
          }}
          disabled={isSubmitting}
          loading={isSubmitting}
          uppercase
          contentStyle={{
            marginVertical: 6,
          }}
          labelStyle={{
            fontSize: 24,
          }}
        >
          Register
        </AppButton>
        {rspErrorMsg && (
          <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
        )}

        <AppSpacer height={20} />

        <View className="w-full justify-center items-center flex flex-row">
          <AppText>Already have an account?</AppText>
          <Link href={"/(auth)/login"} style={{ marginStart: 4 }}>
            <AppText type={TextTypEnum.LINK}>Log In</AppText>
          </Link>
        </View>
      </AppView>
    </AppScrollView>
  );
}
