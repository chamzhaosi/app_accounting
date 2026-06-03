import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import AppDivider from "../../components/AppDivider";
import AppListCardView, {
  AppListCardItemType,
} from "../../components/AppListCardView";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import { ACCOUNT_TYPE_ICONS } from "../../constants/account_type";
import {
  accountTypeFormDefaultValues,
  accountTypeFormSchema,
  AccountTypeFormType,
} from "../../forms/account_type/schemas/accout_type.schemas";
import { useThemeStore } from "../../stores/useThemeStore";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppButton, { ButtonTypeEnum } from "../../components/AppButton";
import { router } from "expo-router";

export default function AccountTypeCreate() {
  const { THEME } = useThemeStore();

  const iconData = ACCOUNT_TYPE_ICONS.map((i) => ({
    ...i,
    label: "",
    isEditable: true,
  }));

  const [selectedIcon, setSelectedIcon] = useState<AppListCardItemType>(
    iconData[0],
  );
  const [isSavingAndNewType, setIsSavingAndNewType] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");

  const DefaultIcon = useMemo(
    () => iconData.find((i) => i.id === selectedIcon.id)?.icon ?? Wallet,
    [selectedIcon],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountTypeFormType>({
    resolver: zodResolver(accountTypeFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: accountTypeFormDefaultValues,
  });

  const onSubmit = async (value: AccountTypeFormType) => {
    const data = { ...value, icon: selectedIcon.id };
    setRspErrorMsg("");
    console.log(data);
    setIsSavingAndNewType(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsSavingAndNewType(false);
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView className="bg-LIGHT-BG_SECONDARY dark:bg-DARK-BG_SECONDARY">
        <AppView className="flex-none flex-row justify-around px-4 pt-2 bg-inherit dark:bg-inherit">
          <View
            className="items-center justify-center p-4 rounded-lg mr-4 mt-2 
            bg-LIGHT-LIST_ITEM_BG_PRESSED dark:bg-DARK-LIST_ITEM_BG_PRESSED"
          >
            <DefaultIcon size={48} color={THEME.TEXT_PRIMARY} />
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
                  autoFocus
                  editable={!isSavingAndNewType || !isSaving}
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

        <AppView className="flex-0 flex-row gap-4 mx-4 mt-3 justify-center items-center ms-4 bg-inherit dark:bg-inherit">
          <AppButton
            className="flex-1 bg-LIGHT-BTN_ACCENT dark:bg-DARK-BTN_ACCENT"
            label="Save & New Type"
            labelClassName="text-lg mx-2 text-LIGHT-TEXT_ACCENT dark:text-DARK-TEXT_SECONDARY font-ROBOTO_MONO font-light"
            type={ButtonTypeEnum.SECONDARY}
            disabled={isSavingAndNewType || isSaving}
            isLoading={isSavingAndNewType}
            onPress={() => {
              Keyboard.dismiss();
              handleSubmit(onSubmit)();
            }}
          />

          <AppButton
            className="flex-[0.4] bg-LIGHT-BTN_ACCENT_ACTIVE dark:bg-DARK-BTN_ACCENT_ACTIVE"
            label="Save"
            labelClassName="text-lg mx-2 text-LIGHT-TEXT_ACCENT dark:text-DARK-TEXT_SECONDARY font-ROBOTO_MONO font-light "
            type={ButtonTypeEnum.PRIMARY}
            disabled={isSavingAndNewType || isSaving}
            isLoading={isSaving}
            onPress={() => {
              Keyboard.dismiss();
              handleSubmit(onSubmit)();
            }}
          />
        </AppView>

        <AppDivider className="mx-4" />

        <AppView className="bg-inherit dark:bg-inherit">
          <AppListCardView
            data={iconData}
            onPress={(item) => setSelectedIcon(item)}
            selectedId={selectedIcon.id}
            isShowIconOnly
          ></AppListCardView>
        </AppView>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
