import { useRef, useState } from "react";
import { Keyboard, TextInput, TouchableWithoutFeedback } from "react-native";
import AppButton, { ButtonTypeEnum } from "../../components/AppButton";
import AppScrollView from "../../components/AppScrollView";
import AppSpacer from "../../components/AppSpacer";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import { useForm, Controller } from "react-hook-form";
import {
  loginFormDefaultValues,
  LoginFormType,
  loginSchema,
} from "../../forms/auth/schemas/login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";

export default function Loign() {
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: loginFormDefaultValues,
  });

  const loginSubmitter = async (data: LoginFormType) => {
    setRspErrorMsg("");
    console.log(data);
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsSubmitting(false);
    setRspErrorMsg("Email or password is invalid. Please try again.");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView className="flex-1 bg-lightBgPrimary dark:bg-gray-900">
        <AppView
          isSafe
          className="flex-grow-[0.25] w-full justify-center items-center m-0 "
        >
          <AppText isTitle className="text-7xl font-robotoMono font-[600]">
            Finora
          </AppText>
          <AppText className="text-gray-800">Personal Accounting App</AppText>
        </AppView>
        <AppScrollView
          className="pt-8 bg-lightBgSecondary rounded-t-[50]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 1,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <AppView isSafe className="items-center">
            <AppText isTitle className="text-[2rem] text-start w-[90%] ms-4">
              SIGN IN
            </AppText>

            <AppSpacer />

            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <AppTextInput
                  ref={emailRef}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  submitBehavior="submit"
                  onSubmitEditing={() => passwordRef.current?.focus()}
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
              render={({ field: { value, onChange, onBlur } }) => (
                <AppTextInput
                  ref={passwordRef}
                  placeholder="Password"
                  secureTextEntry
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  onSubmitEditing={handleSubmit(loginSubmitter)}
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
              labelClassName="text-lightTextAccent font-robotoMono font-light"
              type={ButtonTypeEnum.PRIMARY}
              disabled={isSubmitting}
              isLoading={isSubmitting}
              onPress={() => {
                Keyboard.dismiss();
                handleSubmit(loginSubmitter)();
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
