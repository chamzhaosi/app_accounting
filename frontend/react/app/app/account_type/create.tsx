import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { router } from "expo-router";
import AccTypeIconsList from "../../components/account_types/AccTypeIconsList";
import AppButton, { ButtonType } from "../../components/AppButton";
import AppDivider from "../../components/AppDivider";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import AppIcon, { AppIconProps } from "../../components/AccIcon";
import { ACCOUNT_TYPE_ICONS } from "../../constants/account_type";
import {
  accountTypeFormDefaultValues,
  accountTypeFormSchema,
  AccountTypeFormType,
} from "../../forms/account_type/schemas/accout_type.schemas";
import { useThemeStore } from "../../stores/useThemeStore";
import { AppToast } from "../../components/AppToast";
import { TextInput } from "react-native-paper";

export default function AccountTypeCreate() {
  const { THEME } = useThemeStore();

  const [selectedItem, setSelectedItem] = useState<AppIconProps["name"]>(
    ACCOUNT_TYPE_ICONS[0],
  );
  const [isSavingAndNewType, setIsSavingAndNewType] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");
  const isSubmitting = isSavingAndNewType || isSaving;

  const { control, handleSubmit, formState, setValue, reset } =
    useForm<AccountTypeFormType>({
      resolver: zodResolver(accountTypeFormSchema),
      mode: "onBlur",
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
    await new Promise((res) =>
      setTimeout(() => {
        res("success");
        AppToast.success({ message: "Add account type successfully" });
      }, 2000),
    );
    setLoading(false);
    // saveAnotherType ? formReset() : router.back();
    setRspErrorMsg("Account type already added.");
  };

  const formReset = () => {
    reset();
    setSelectedItem(ACCOUNT_TYPE_ICONS[0]);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView isSafe edges={["left", "right", "bottom"]}>
        <AppView className="flex-none flex-row justify-around px-4 pt-2 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
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
                  onBlur={onBlur}
                  value={value}
                  maxLength={20}
                  onClearBtn={() => setValue("label", "")}
                  errorDetail={error}
                />
              )}
            />
          </View>
        </AppView>

        <AppView className="flex-0 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer p-4">
          <AppView className="flex-0 flex-row gap-4 justify-center items-center bg-inherit dark:bg-inherit">
            <AppButton
              disabled={isSubmitting}
              loading={isSaving}
              variant={ButtonType.SECONDARY}
              onPress={() => {
                Keyboard.dismiss();
                handleSubmit((value) => onSubmit(value, false))();
              }}
              contentStyle={{
                marginBlock: 0,
              }}
              labelStyle={{
                fontSize: 18,
              }}
              style={{ flex: 0.4, borderRadius: 8 }}
            >
              Save
            </AppButton>
            <AppButton
              disabled={isSubmitting}
              loading={isSavingAndNewType}
              onPress={() => {
                Keyboard.dismiss();
                handleSubmit((value) => onSubmit(value, true))();
              }}
              contentStyle={{ marginBlock: 0 }}
              labelStyle={{ fontSize: 18 }}
              style={{ flex: 1, borderRadius: 8 }}
            >
              Save & New Type
            </AppButton>
          </AppView>

          {rspErrorMsg && (
            <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
          )}
        </AppView>

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
