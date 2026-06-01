import { useRef, useState } from "react";
import { Keyboard, TextInput, TouchableWithoutFeedback } from "react-native";
import AppButton, { ButtonTypeEnum } from "../../components/AppButton";
import AppScrollView from "../../components/AppScrollView";
import AppSpacer from "../../components/AppSpacer";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import {
  registerFormDefaultValues,
  RegisterFormType,
  registerSchema,
} from "../../forms/auth/schemas/register.schema";

export default function Register() {
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
    mode: "onBlur",
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
          className="pt-8 bg-LIGHT-BG_SECONDARY rounded-t-[50]"
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
              <AppText type={TextTypEnum.ERROR}>
                {errors.password.message}
              </AppText>
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
              className="bg-LIGHT-BTN_SECONDARY dark:bg-DARK-BTN_SECONDARY"
              label="SUBMIT"
              labelClassName="text-LIGHT-TEXT_ACCENT font-ROBOTO_MONO font-light"
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
                Already have an account?
              </AppText>
              <Link href={"/(auth)/login"}>
                <AppText className="font-semibold" type={TextTypEnum.LINK}>
                  Log In
                </AppText>
              </Link>
            </AppView>
          </AppView>
        </AppScrollView>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
