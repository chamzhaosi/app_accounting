import { useRef, useState } from "react";
import { Keyboard, TextInput, TouchableWithoutFeedback } from "react-native";
import AppButton, { ButtonTypeEnum } from "../../components/AppButton";
import AppScrollView from "../../components/AppScrollView";
import AppSpacer from "../../components/AppSpacer";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";

export default function Loign() {
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loginSubmitter = async () => {
    console.log(email);
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsSubmitting(false);
  };

  return (
    <AppScrollView>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <AppView isSafe className="justify-center items-center">
          <AppView className="w-[90%] justify-center items-center mb-[150px]">
            <AppText isTitle className="text-7xl">
              Finora
            </AppText>
            <AppText className="text-gray-800">Personal Accounting App</AppText>
          </AppView>

          <AppText
            isTitle
            className="text-[2rem] text-start w-[90%] text-gray-800"
          >
            SIGN IN
          </AppText>

          <AppSpacer />

          <AppTextInput
            ref={emailRef}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
            value={email}
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <AppText type={TextTypEnum.ERROR}>Please enter valid email</AppText>

          <AppSpacer height={10} />

          <AppTextInput
            ref={passwordRef}
            placeholder="Password"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            onSubmitEditing={loginSubmitter}
          />
          <AppText type={TextTypEnum.ERROR}>Please enter password</AppText>

          <AppSpacer height={20} />

          <AppButton
            label="Login"
            labelClassName="text-slate-200 font-semibold"
            type={ButtonTypeEnum.PRIMARY}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            onPress={loginSubmitter}
          />
          <AppText type={TextTypEnum.ERROR}>Invalid email or password</AppText>
        </AppView>
      </TouchableWithoutFeedback>
    </AppScrollView>
  );
}
