import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";

import { router } from "expo-router";
import AppButton from "../../components/AppButton";
import AppDivider from "../../components/AppDivider";
import AppListCardView, {
  AppListCardItemType,
} from "../../components/AppListCardView";
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
import { getItemIcon } from "../../utils/common";

export default function AccountTypeCreate() {
  const { THEME } = useThemeStore();

  const iconData = ACCOUNT_TYPE_ICONS.map((i) => ({
    ...i,
    label: "",
    icon: i.id,
    isEditable: true,
  }));

  const [selectedIcon, setSelectedIcon] = useState<AppListCardItemType>({
    ...iconData[0],
    icon: iconData[0].id,
  });
  const [isSavingAndNewType, setIsSavingAndNewType] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");
  const isSubmitting = isSavingAndNewType || isSaving;

  const DefaultIcon = useMemo(
    () => getItemIcon(selectedIcon.id),
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
    setIsSaving(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsSaving(false);
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView isSafe edges={["left", "right", "bottom"]}>
        <AppView className="flex-none flex-row justify-around px-4 pt-2 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
          <View
            className="items-center justify-center p-4 rounded-lg mr-4 mt-2 
            bg-LIGHT-tertiary dark:bg-DARK-tertiary"
          >
            <DefaultIcon size={48} color={THEME.onTertiary} />
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
            loading={isSaving}
            onPress={() => {
              Keyboard.dismiss();
              handleSubmit(onSubmit)();
            }}
            contentStyle={{
              marginBlock: 0,
              ...(!isSubmitting ? { backgroundColor: THEME.secondary } : {}),
            }}
            labelStyle={{
              fontSize: 18,
              ...(!isSubmitting ? { color: THEME.onSecondary } : {}),
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
              handleSubmit(onSubmit)();
            }}
            contentStyle={{ marginBlock: 0 }}
            labelStyle={{ fontSize: 18 }}
            style={{ flex: 1, borderRadius: 8 }}
          >
            Save & New Type
          </AppButton>
        </AppView>

        <AppDivider />

        <AppView className="bg-LIGHT-surfaceContainerHigh dark:bg-DARK-surfaceContainerHigh">
          <AppListCardView
            data={iconData}
            onPress={(item) => setSelectedIcon(item)}
            selectedId={selectedIcon.id}
            getItemIcon={getItemIcon}
            isShowIconOnly
          ></AppListCardView>
        </AppView>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
