import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import AppIcon, { AppIconProps } from "../../components/AccIcon";
import AccTypeIconsList from "./_components/AccTypeIconsList";
import AppButton, {
  AppButtonProps,
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDialog from "../../components/AppDialog";
import AppDivider from "../../components/AppDivider";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import {
  accountTypeFormDefaultValues,
  accountTypeFormSchema,
  AccountTypeFormType,
  LABEL_MAX_LEN,
} from "../../forms/schemas/accout_type.schemas";
import { useThemeStore } from "../../stores/useThemeStore";
import { ICONS } from "../../constants/icons";
import { DIALOG_COMMON_BTN_PROPS } from "../../constants/size";

export default function AccountTypeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { THEME } = useThemeStore();

  const [selectedItem, setSelectedItem] = useState<AppIconProps["name"]>(
    ICONS.ACCOUNT_TYPE[0],
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const isSubmitting = isDeleting || isSaving;

  const { control, handleSubmit, setValues } = useForm<AccountTypeFormType>({
    resolver: zodResolver(accountTypeFormSchema),
    mode: "onChange",
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
      <AppView>
        <AppDialog
          title="Delete"
          description="Are you sure you want to delete this account type?
          Accounts associated with this type will not be affected."
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
                  editable={!isSubmitting}
                  onChangeText={onChange}
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
              variant={ButtonType.SECONDARY}
              style={{ flex: 0.4, borderRadius: 8 }}
              {...SUBMIT_BTN_CONTENT_STYLE}
            >
              Save
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
        />
      </AppView>
    </TouchableWithoutFeedback>
  );
}
