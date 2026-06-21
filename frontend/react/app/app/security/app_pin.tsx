import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import AppButton, {
  AUTH_SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppSpacer from "../../components/AppSpacer";
import AppSwitch from "../../components/AppSwitch";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import { AppToast } from "../../components/AppToast";
import AppView from "../../components/AppView";
import {
  createAppPinFormDefaultValues,
  createAppPinFormSchema,
  CreateAppPinFormType,
} from "../../forms/schemas/create_app_pin.schema";
import { checkPin, clearAppPINLock, createPin } from "../../local/auth";
import {
  APP_PIN_HASH_KEY,
  APP_PIN_LOCK_KEY,
  BIOMETRIC_LOCK_KEY,
  getStoredItem,
  PIN_PATTERN_LOCK_KEY,
  setStoredItem,
} from "../../local/secureStore";
import {
  LocalAuthType,
  useLocalAuthStore,
} from "../../stores/useLocalAuthStore";

// TODO: when unenable the swtich need to auth one more time
export default function AppPin() {
  const { lock_type } = useLocalSearchParams<{
    lock_type: string;
  }>();

  const { setLocalAuthType } = useLocalAuthStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSwitchChanging, setIsSwitchChanging] = useState<boolean>(false);
  const [isDeviceLockEnabled, setIsDeviceLockEnabled] =
    useState<boolean>(false);
  const [isAppPINEnabled, setIsAppPINEnabled] = useState<boolean>(!!lock_type);

  const [errorMsg, setErrorMsg] = useState<string>("");
  const [hasHashPIN, setHasHashPIN] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setFocus,
    setError,
    formState: { errors },
  } = useForm<CreateAppPinFormType>({
    resolver: zodResolver(createAppPinFormSchema(hasHashPIN)),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: createAppPinFormDefaultValues,
  });

  const isFormError = Object.keys(errors).length > 0;

  const onSubmit = async (data: CreateAppPinFormType) => {
    try {
      setIsSubmitting(true);
      if (hasHashPIN) {
        const isSame = await checkPin(data.currentPin!);
        if (!isSame) {
          setError("currentPin", { message: "Incorrent PIN" });
          return;
        }
      }

      await createPin(data.pin);
      await setStoredItem(APP_PIN_LOCK_KEY, "true");
      AppToast.success({
        message: "PIN create successfully.",
      });
      lock_type && setLocalAuthType(lock_type as LocalAuthType);
      router.back();
    } catch (e) {
      console.error("Error when set/ change app PIN", e);
      setErrorMsg("Error when setting or changing app PIN");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppPINChange = async (value: boolean) => {
    try {
      if (!value) {
        setIsSwitchChanging(true);
        await clearAppPINLock();
      }

      setIsAppPINEnabled(value);
    } catch (e) {
      console.error("Error when changing app pin swtich", e);
    } finally {
      setIsSwitchChanging(false);
    }
  };

  useEffect(() => {
    const loadAppPINData = async () => {
      try {
        const isBiometricLockEnabled = await getStoredItem(BIOMETRIC_LOCK_KEY);
        const isPinPatternLockEnabled =
          await getStoredItem(PIN_PATTERN_LOCK_KEY);

        const isDeviceLockEnabled =
          isBiometricLockEnabled === "true" ||
          isPinPatternLockEnabled === "true";
        setIsDeviceLockEnabled(isDeviceLockEnabled);

        const hashPINInStore = !!(await getStoredItem(APP_PIN_HASH_KEY));
        setHasHashPIN(hashPINInStore);
        !isAppPINEnabled && setIsAppPINEnabled(hashPINInStore);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppPINData();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView className="p-4 pt-1 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
        <AppSwitch
          label="App PIN"
          disabled={
            isLoading ||
            isSubmitting ||
            isSwitchChanging ||
            isDeviceLockEnabled ||
            !!lock_type
          }
          value={isAppPINEnabled}
          onValueChange={handleAppPINChange}
        />
        <View className="-mt-4 mb-4 pl-2 flex flex-col gap-1">
          <AppText>Create an App PIN to protect your Finora account.</AppText>

          <AppText>
            You can also enable biometric or device authentication for quicker
            access.
          </AppText>
        </View>

        {isAppPINEnabled && (
          <>
            {hasHashPIN && (
              <>
                <Controller
                  control={control}
                  name="currentPin"
                  render={({ field: { value, onChange, onBlur, ref } }) => (
                    <AppTextInput
                      ref={ref}
                      mode="outlined"
                      placeholder="Current PIN"
                      label={"Current PIN"}
                      editable={!isSubmitting}
                      disabled={isSubmitting || isLoading}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      keyboardType="number-pad"
                      maxLength={6}
                      submitBehavior="submit"
                      isMaskValue
                      onSubmitEditing={() => setFocus("pin")}
                      errorField={errors.currentPin}
                    />
                  )}
                />
                <AppSpacer height={12} />
              </>
            )}

            <Controller
              control={control}
              name="pin"
              render={({ field: { value, onChange, onBlur, ref } }) => (
                <AppTextInput
                  ref={ref}
                  mode="outlined"
                  placeholder="PIN"
                  label={"PIN"}
                  editable={!isSubmitting}
                  disabled={isSubmitting || isLoading}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  keyboardType="number-pad"
                  maxLength={6}
                  submitBehavior="submit"
                  isMaskValue
                  onSubmitEditing={() => setFocus("cfmPin")}
                  errorField={errors.pin}
                />
              )}
            />
            <AppSpacer height={12} />
            <Controller
              control={control}
              name="cfmPin"
              render={({ field: { value, onChange, onBlur, ref } }) => (
                <AppTextInput
                  ref={ref}
                  mode="outlined"
                  placeholder="Confirm PIN"
                  label={"Confirm Password"}
                  editable={!isSubmitting}
                  disabled={isSubmitting}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={value}
                  isMaskValue
                  onSubmitEditing={handleSubmit(onSubmit)}
                  errorField={errors.cfmPin}
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
              {`${hasHashPIN ? "Update" : "Create"} PIN`}
            </AppButton>
            {errorMsg && <AppText type={TextTypEnum.ERROR}>{errorMsg}</AppText>}
          </>
        )}
      </AppView>
    </TouchableWithoutFeedback>
  );
}
