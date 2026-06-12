import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import AppIcon, { AppIconProps } from "../../components/AccIcon";
import AccTypeIconsList from "../../components/account_types/AccTypeIconsList";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDivider from "../../components/AppDivider";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import { ACCOUNT_TYPE_ICONS } from "../../constants/account_type";
import {
  accountTypeFormDefaultValues,
  accountTypeFormSchema,
  AccountTypeFormType,
  LABEL_MAX_LEN,
} from "../../forms/schemas/accout_type.schemas";
import { useThemeStore } from "../../stores/useThemeStore";

export default function AccountTypeCreate() {
  const { THEME } = useThemeStore();

  const [selectedItem, setSelectedItem] = useState<AppIconProps["name"]>(
    ACCOUNT_TYPE_ICONS[0],
  );
  const [isSavingAndNewType, setIsSavingAndNewType] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");
  const isSubmitting = isSavingAndNewType || isSaving;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AccountTypeFormType>({
    resolver: zodResolver(accountTypeFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: accountTypeFormDefaultValues,
  });

  const onSubmit = async (
    value: AccountTypeFormType,
    saveAnotherType: boolean,
  ) => {
    const data = { ...value, icon: selectedItem };
    const setLoading = saveAnotherType ? setIsSavingAndNewType : setIsSaving;

    setRspErrorMsg("");
    console.log(data);
    setLoading(true);
    // await new Promise((res) =>
    //   setTimeout(() => {
    //     res("success");
    //     AppToast.success({ message: "Add account type successfully" });
    //   }, 2000),
    // );
    // setLoading(false);
    // saveAnotherType ? formReset() : router.back();
    await new Promise((res) => setTimeout(res, 200));
    setLoading(false);
    setRspErrorMsg("Account type already added.");
  };

  const formReset = () => {
    reset();
    setSelectedItem(ACCOUNT_TYPE_ICONS[0]);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView>
        <View className="flex-row justify-around px-4 pt-2 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
          <View
            className="items-center justify-center p-4 rounded-lg mr-4 mt-2 
            bg-LIGHT-tertiary dark:bg-DARK-tertiary"
          >
            <AppIcon name={selectedItem} size={48} color={THEME.onTertiary} />
          </View>

          <View className="flex-1 justify-center">
            <Controller
              control={control}
              name="label"
              render={({
                field: { value, onChange, onBlur, ref },
                fieldState: { error },
              }) => (
                <AppTextInput
                  ref={ref}
                  mode="outlined"
                  label={"Label"}
                  autoFocus
                  editable={!isSubmitting}
                  onChangeText={onChange}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  maxLength={LABEL_MAX_LEN}
                  showClear
                  errorField={error}
                />
              )}
            />
          </View>
        </View>

        <View className="m-4 mt-0 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
          <View className="flex-row items-center justify-center gap-4 mt-4">
            <AppButton
              disabled={isSubmitting}
              loading={isSaving}
              variant={ButtonType.SECONDARY}
              onPress={() => {
                Keyboard.dismiss();
                handleSubmit((value) => onSubmit(value, false))();
              }}
              style={{ flex: 0.4, borderRadius: 8 }}
              {...SUBMIT_BTN_CONTENT_STYLE}
            >
              Save
            </AppButton>
            <AppButton
              disabled={isSubmitting}
              loading={isSavingAndNewType}
              onPress={() => {
                !errors.label && Keyboard.dismiss();
                handleSubmit((value) => onSubmit(value, true))();
              }}
              style={{ flex: 1, borderRadius: 8 }}
              {...SUBMIT_BTN_CONTENT_STYLE}
            >
              Save & New Type
            </AppButton>
          </View>

          {rspErrorMsg && (
            <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
          )}
        </View>

        <AppDivider />

        <AccTypeIconsList
          setSelectedItem={setSelectedItem}
          selectedItem={selectedItem}
          disabled={isSubmitting}
        />
      </AppView>
    </TouchableWithoutFeedback>
  );
}
