import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  Pressable,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import AppIcon, { AppIconProps } from "../../components/AccIcon";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppScrollView from "../../components/AppScrollView";
import AppSelect, { SelectOptionType } from "../../components/AppSelect";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import { ACCOUNT_TYPE_ICONS } from "../../constants/account_type";
import {
  categoryManagementFormDefaultValues,
  categoryManagementFormSchema,
  CategoryManagementFormType,
  DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN,
} from "../../forms/schemas/category_management.schemas";
import { useThemeStore } from "../../stores/useThemeStore";
import { TouchableRipple } from "react-native-paper";
import AppText, { TextTypEnum } from "../../components/AppText";

export default function CategoryManagementCreate() {
  const { type } = useLocalSearchParams<{ type: string }>();

  const { THEME } = useThemeStore();

  const [isSavingAndNewAcc, setIsSavingAndNewAcc] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const isSubmitting = isSavingAndNewAcc || isSaving;
  const [isChsgIcon, setIsChsgIcon] = useState<boolean>(false);

  const [selectedItem, setSelectedItem] = useState<AppIconProps["name"]>(
    ACCOUNT_TYPE_ICONS[0],
  );

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<CategoryManagementFormType>({
    resolver: zodResolver(categoryManagementFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: categoryManagementFormDefaultValues,
  });

  const OPTIONS: SelectOptionType[] = [
    {
      id: 1,
      label: "Income",
      value: "inc",
    },
    { id: 2, label: "Expense", value: "exp" },
  ];

  const onSubmit = (
    value: CategoryManagementFormType,
    saveAnotherAcc: boolean,
  ) => {
    console.log(value, saveAnotherAcc);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView>
        <AppScrollView
          className="flex-1 p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer pb-0"
          contentContainerStyle={{
            justifyContent: "flex-start",
            paddingBottom: 25,
          }}
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
                label="Transaction Type"
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

          <View className="flex-row justify-around mb-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
            {/* <Pressable
              className="items-center justify-center p-2 rounded-lg mr-4 mt-2 flex-[0.2] 
            bg-LIGHT-tertiary dark:bg-DARK-tertiary"
              onPress={() => {
                console.log("show modal");
              }}
            >
              <AppIcon name={selectedItem} size={38} color={THEME.onTertiary} />
            </Pressable> */}
            <View className="flex-[0.2] items-center justify-center p-2 rounded-lg mr-4 mt-2">
              <Controller
                control={control}
                name="icon"
                render={({
                  field: { value, onChange, onBlur, ref },
                  fieldState: { error },
                }) => (
                  <Pressable
                    // className="flex-[0.2] items-center justify-center p-2 rounded-lg mr-4 mt-2"
                    style={{
                      borderStyle: "dashed",
                      borderColor: THEME.outline,
                      borderWidth: 2,
                    }}
                    onPress={() => {
                      console.log("show modal");
                    }}
                  >
                    {error?.message && (
                      <AppText className="flex-1" type={TextTypEnum.ERROR}>
                        {error.message}
                      </AppText>
                    )}
                    {/* <AppIcon name={selectedItem} size={38} color={THEME.onTertiary} /> */}
                  </Pressable>
                )}
              />
            </View>
            <View className="flex-[0.8] justify-center">
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
                // submitBehavior="submit"
                // onSubmitEditing={() => setFocus("initialValue")}
              />
            )}
          />

          <View className="flex-row items-center justify-center gap-4 my-4">
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
              Save & New Account
            </AppButton>
          </View>
        </AppScrollView>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
