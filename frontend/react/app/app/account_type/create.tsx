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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsSubmitting(false);
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView>
        <AppView className="flex-none flex-row justify-around px-4">
          <View
            className="items-center justify-center p-4 rounded-md mr-4 mt-2 
            bg-LIGHT-LIST_ITEM_BG dark:bg-DARK-LIST_ITEM_BG"
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
          </View>
        </AppView>

        <AppDivider className="mx-4" />

        <AppView>
          <AppListCardView
            data={iconData}
            onPress={(item) => setSelectedIcon(item)}
            selectedId={selectedIcon.id}
            extraScrollHeight={-80}
            isShowIconOnly
          ></AppListCardView>
        </AppView>

        <AppView isSafe className="flex-[0.1] m-4 justify-center bg-red-400">
          <AppButton
            label="Add"
            labelClassName="text-LIGHT-TEXT_ACCENT dark:text-DARK-TEXT_SECONDARY font-ROBOTO_MONO font-light"
            type={ButtonTypeEnum.PRIMARY}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            onPress={() => {
              Keyboard.dismiss();
              handleSubmit(onSubmit)();
            }}
          />
          {rspErrorMsg && (
            <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
          )}
        </AppView>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
