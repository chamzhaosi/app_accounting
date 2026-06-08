import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { router } from "expo-router";
import AppIcon, { AppIconProps } from "../../components/AccIcon";
import AccTypeIconsList from "../../components/account_types/AccTypeIconsList";
import AppButton, {
  AppButtonProps,
  ButtonType,
} from "../../components/AppButton";
import AppDialog from "../../components/AppDialog";
import AppDivider from "../../components/AppDivider";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import { ACCOUNT_TYPE_ICONS } from "../../constants/account_type";
import {
  accountTypeFormDefaultValues,
  accountTypeFormSchema,
  AccountTypeFormType,
} from "../../forms/account_type/schemas/accout_type.schemas";
import { useThemeStore } from "../../stores/useThemeStore";

export default function AccountTypeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { THEME } = useThemeStore();

  const [selectedItem, setSelectedItem] = useState<AppIconProps["name"]>(
    ACCOUNT_TYPE_ICONS[0],
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const isSubmitting = isDeleting || isSaving;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValues,
  } = useForm<AccountTypeFormType>({
    resolver: zodResolver(accountTypeFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: accountTypeFormDefaultValues,
  });

  const onSubmit = async (value: AccountTypeFormType) => {
    const data = { ...value, icon: selectedItem };
    setRspErrorMsg("");
    console.log(data);
    setIsSaving(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsSaving(false);
    router.back();
  };

  const onDelete = async () => {
    setIsDeleting(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsDeleting(false);
    router.back();
  };

  const actionBtnSharedProps: Omit<AppButtonProps, "children"> = {
    labelStyle: { fontSize: 14 },
    contentStyle: {
      marginVertical: 0,
    },
    style: { borderRadius: 8 },
  };

  useEffect(() => {
    setValues({
      label:
        "Card - in card drawer, my friend put de, dont take it Card - in card drawer, my friend put de, dont take it",
      icon: "CreditCard",
    });
    setSelectedItem("CreditCard");
  }, [id]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView isSafe edges={["left", "right", "bottom"]}>
        <AppDialog
          title="Delete"
          description="Are you sure you want to delete this account type?
          Accounts associated with this type will not be affected."
          showDialog={showDialog}
          onDismiss={() => setShowDialog(false)}
          actionRender={
            <>
              <AppButton
                {...actionBtnSharedProps}
                onPress={() => setShowDialog(false)}
              >
                No
              </AppButton>
              <AppButton
                {...actionBtnSharedProps}
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
              render={({ field: { value, onChange, onBlur, ref } }) => (
                <AppTextInput
                  ref={ref}
                  mode="outlined"
                  label={"Label"}
                  editable={!isSubmitting}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            {errors.label && (
              <AppText type={TextTypEnum.ERROR}>{errors.label.message}</AppText>
            )}
            {rspErrorMsg && (
              <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
            )}
          </View>
        </AppView>

        <AppView className="flex-0 flex-row gap-4 p-4 justify-center items-center bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
          <AppButton
            disabled={isSubmitting}
            loading={isDeleting}
            onPress={() => {
              Keyboard.dismiss();
              setShowDialog(true);
            }}
            variant={ButtonType.ERROR}
            contentStyle={{ marginBlock: 0 }}
            labelStyle={{ fontSize: 18 }}
            style={{ flex: 1, borderRadius: 8 }}
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
            variant={ButtonType.SECONDARY}
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
        </AppView>

        <AppDivider />

        <AccTypeIconsList
          setSelectedItem={setSelectedItem}
          selectedItem={selectedItem}
        />
      </AppView>
    </TouchableWithoutFeedback>
  );
}
