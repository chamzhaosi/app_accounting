import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  accountManagementFormDefaultValues,
  accountManagementFormSchema,
  AccountManagementFormType,
  DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN,
} from "../../forms/schemas/account_management.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import AppSelect, { SelectOptionType } from "../../components/AppSelect";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import AppView from "../../components/AppView";
import AppTextInput from "../../components/AppTextInput";
import AppAmtInput from "../../components/AppAmtInput";
import AppSwitch from "../../components/AppSwitch";
import AppDivider from "../../components/AppDivider";
import AppButton, {
  AppButtonProps,
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import { router, useLocalSearchParams } from "expo-router";
import AppDialog from "../../components/AppDialog";
import { DIALOG_COMMON_BTN_PROPS } from "../../constants/size";

export default function AccountManagementDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const isSubmitting = isDeleting || isSaving;

  const {
    control,
    handleSubmit,
    setValues,
    reset,
    formState: { errors },
    setFocus,
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

  const onSubmit = (value: AccountManagementFormType) => {
    console.log(value);
  };

  const onDelete = async () => {
    setIsDeleting(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsDeleting(false);
    router.back();
  };

  useEffect(() => {
    setValues({
      typeId: 1,
      label: "Cash - In Car",
      descriptions: "This cash is using for petrol only",
      initialValue: "1088.00",
      isMainAccount: false,
    });
  }, [id]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView
        isSafe
        edges={["bottom", "left", "left"]}
        className="p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer"
      >
        <AppDialog
          title="Delete"
          description="Are you sure you want to delete this account?
                  Transactions associated with this account will not be affected."
          showDialog={showDialog}
          onDismiss={() => setShowDialog(false)}
          actionRender={
            <>
              <AppButton
                {...DIALOG_COMMON_BTN_PROPS}
                onPress={() => setShowDialog(false)}
              >
                No
              </AppButton>
              <AppButton
                {...DIALOG_COMMON_BTN_PROPS}
                variant={ButtonType.ERROR}
                onPress={() => {
                  setShowDialog(false);
                  onDelete();
                }}
              >
                Yes
              </AppButton>
            </>
          }
        />
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
            loading={isDeleting}
            onPress={() => {
              Keyboard.dismiss();
              setShowDialog(true);
            }}
            variant={ButtonType.ERROR}
            style={{ flex: 1, borderRadius: 8 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Delete
          </AppButton>
          <AppButton
            disabled={isSubmitting}
            loading={isSaving}
            onPress={() => {
              Keyboard.dismiss();
              handleSubmit(onSubmit)();
            }}
            variant={ButtonType.PRIMARY}
            style={{ flex: 0.4, borderRadius: 8 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save
          </AppButton>
        </View>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
