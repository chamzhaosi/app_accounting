import { zodResolver } from "@hookform/resolvers/zod";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import AppAmtInput from "../../components/AppAmtInput";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDivider from "../../components/AppDivider";
import AppScrollView from "../../components/AppScrollView";
import AppSelect, { SelectOptionType } from "../../components/AppSelect";
import AppSwitch from "../../components/AppSwitch";
import AppTextInput from "../../components/AppTextInput";
import {
  accountManagementFormDefaultValues,
  accountManagementFormSchema,
  AccountManagementFormType,
  DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN,
} from "../../forms/schemas/account_management.schema";

export default function AccountManagementCreate() {
  const [isSavingAndNewAcc, setIsSavingAndNewAcc] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const isSubmitting = isSavingAndNewAcc || isSaving;

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<AccountManagementFormType>({
    resolver: zodResolver(accountManagementFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: accountManagementFormDefaultValues,
  });

  const OPTIONS: SelectOptionType[] = [
    {
      id: 1,
      icon: "Banknote",
      label: "Cash",
      value: "Cash",
    },
    { id: 2, icon: "Landmark", label: "Bank", value: "Bank" },
    {
      id: 3,
      icon: "WalletMinimal",
      label: "Wallet",
      value: "Wallet",
    },
    { id: 4, icon: "CreditCard", label: "Credit Card", value: "Credit Card" },
    {
      id: 5,
      icon: "CreditCard",
      label: "Debit Card",
      value: "Debit Card",
    },
  ];

  const onSubmit = (
    value: AccountManagementFormType,
    saveAnotherAcc: boolean,
  ) => {
    console.log(value, saveAnotherAcc);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppScrollView
        className="p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer"
        contentContainerStyle={{ justifyContent: "flex-start" }}
      >
        <Controller
          control={control}
          name="typeId"
          render={({
            field: { value, onChange, onBlur, ref },
            fieldState: { error },
          }) => (
            <AppSelect
              ref={ref}
              label="Account Type"
              value={value.toString()}
              onChange={onChange}
              onBlur={onBlur}
              options={OPTIONS}
              errorField={error}
              disabled={isSubmitting}
              showClear
            />
          )}
        />
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
              label="Label"
              disabled={isSubmitting}
              onChangeText={onChange}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              maxLength={LABEL_MAX_LEN}
              showClear
              errorField={error}
              submitBehavior="submit"
              onSubmitEditing={() => setFocus("descriptions")}
            />
          )}
        />

        <Controller
          control={control}
          name="descriptions"
          render={({
            field: { value, onChange, onBlur, ref },
            fieldState: { error },
          }) => (
            <AppTextInput
              ref={ref}
              mode="outlined"
              label="Descriptions"
              numberOfLines={3}
              multiline
              disabled={isSubmitting}
              onChangeText={onChange}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              maxLength={DESCRIPTION_MAX_LEN}
              showClear
              errorField={error}
              submitBehavior="submit"
              onSubmitEditing={() => setFocus("initialValue")}
            />
          )}
        />

        <Controller
          control={control}
          name="initialValue"
          render={({
            field: { value, onChange, onBlur, ref },
            fieldState: { error },
          }) => (
            <AppAmtInput
              ref={ref}
              mode="outlined"
              label="Capital Value"
              disabled={isSubmitting}
              keyboardType="number-pad"
              onChangeText={onChange}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              maxLength={DESCRIPTION_MAX_LEN}
              showClear
              errorField={error}
            />
          )}
        />

        <Controller
          control={control}
          name="isMainAccount"
          render={({ field: { value, onChange, ref } }) => (
            <AppSwitch
              ref={ref}
              label="Main Account"
              disabled={isSubmitting}
              value={value}
              onValueChange={onChange}
            />
          )}
        />
        <AppDivider />
        <View className="flex-row items-center justify-center gap-4 mt-6">
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
            loading={isSavingAndNewAcc}
            onPress={() => {
              !errors.label && Keyboard.dismiss();
              handleSubmit((value) => onSubmit(value, true))();
            }}
            style={{ flex: 1, borderRadius: 8 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save & New
          </AppButton>
        </View>
      </AppScrollView>
    </TouchableWithoutFeedback>
  );
}
