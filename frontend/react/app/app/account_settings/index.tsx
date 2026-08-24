import { router, Stack } from "expo-router";
import { Controller, type FieldError, useWatch } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AppButton, {
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppScrollView from "../../components/AppScrollView";
import AppSelect from "../../components/AppSelect";
import AppSpacer from "../../components/AppSpacer";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import {
  EMAIL_MAX_LEN,
  NICKNAME_MAX_LEN,
} from "../../forms/schemas/account_settings.schema";
import useAccountSettings from "../../hook/account_settings/useAccountSettings";
import { translate } from "../../i18n";
import type { Language } from "../../stores/useLanguageStore";

export default function AccountSettings() {
  const logic = useAccountSettings();
  const previewLanguage = useWatch({
    control: logic.control,
    name: "language",
  });
  const previewText = (text: string) =>
    translate(text, undefined, previewLanguage);
  const previewError = (error?: FieldError) =>
    error?.message ? { ...error, message: previewText(error.message) } : error;

  if (logic.isLoading) {
    return (
      <AppView className="items-center justify-center bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
        <ActivityIndicator />
      </AppView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppScrollView
        className="p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer"
        contentContainerStyle={{ justifyContent: "flex-start" }}
      >
        <Stack.Screen options={{ title: previewText("Account Settings") }} />
        <Controller
          control={logic.control}
          name="nickname"
          render={({ field: { value, onChange, onBlur, ref } }) => (
            <AppTextInput
              ref={ref}
              mode="outlined"
              label={previewText("Nickname (Optional)")}
              placeholder={previewText("Please enter")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onSubmitEditing={() => logic.setFocus("email")}
              maxLength={NICKNAME_MAX_LEN}
              editable={!logic.isSaving}
              shouldTranslateText={false}
              showClear
              errorField={previewError(logic.errors.nickname)}
            />
          )}
        />

        <AppSpacer height={12} />

        <Controller
          control={logic.control}
          name="email"
          render={({ field: { value, onChange, onBlur, ref } }) => (
            <AppTextInput
              ref={ref}
              mode="outlined"
              label={previewText("Email (Optional)")}
              placeholder={previewText("Please enter")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={EMAIL_MAX_LEN}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!logic.isSaving}
              shouldTranslateText={false}
              showClear
              errorField={previewError(logic.errors.email)}
            />
          )}
        />

        <AppSpacer height={12} />

        <Controller
          control={logic.control}
          name="language"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <AppSelect
              label={previewText("Language")}
              placeholder={previewText("Please select")}
              value={value}
              options={[
                { id: "en", value: "en", label: "English" },
                {
                  id: "zh-Hans",
                  value: "zh-Hans",
                  label: "简体中文",
                },
                { id: "ms", value: "ms", label: "Bahasa Melayu" },
              ]}
              showClear={false}
              disabled={logic.isSaving}
              shouldTranslateText={false}
              onChange={(language) => {
                if (language) onChange(language as Language);
              }}
              errorField={previewError(error)}
            />
          )}
        />

        <AppSpacer height={12} />

        <AppButton
          disabled={logic.isSaving}
          loading={logic.isSaving}
          style={{ borderRadius: 10 }}
          shouldTranslateText={false}
          onPress={() => {
            Keyboard.dismiss();
            logic.handleSubmit(async (value) => {
              const isSaved = await logic.onSubmit(value);
              if (isSaved) router.back();
            })();
          }}
          {...SUBMIT_BTN_CONTENT_STYLE}
        >
          {previewText("Save")}
        </AppButton>
      </AppScrollView>
    </TouchableWithoutFeedback>
  );
}
