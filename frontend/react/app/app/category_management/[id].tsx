import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { AppIconProps } from "../../components/AccIcon";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDialog from "../../components/AppDialog";
import AppIconSelect from "../../components/AppIconSelect";
import AppScrollView from "../../components/AppScrollView";
import AppSelect, { SelectOptionType } from "../../components/AppSelect";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import { AppToast } from "../../components/AppToast";
import AppView from "../../components/AppView";
import { ICONS } from "../../constants/icons";
import { DIALOG_COMMON_BTN_PROPS } from "../../constants/size";
import {
  categoryManagementFormDefaultValues,
  categoryManagementFormSchema,
  CategoryManagementFormType,
  DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN,
} from "../../forms/schemas/category_management.schemas";

export default function CategoryManagementDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const isSubmitting = isDeleting || isSaving;

  const {
    control,
    handleSubmit,
    setValues,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<CategoryManagementFormType>({
    resolver: zodResolver(categoryManagementFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: categoryManagementFormDefaultValues,
  });

  const TXN_TYPES_OPTIONS: SelectOptionType[] = [
    {
      id: 1,
      label: "Income",
      value: "inc",
    },
    { id: 2, label: "Expense", value: "exp" },
  ];

  const onDelete = async () => {
    setIsDeleting(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsDeleting(false);
    router.back();
  };

  const onSubmit = async (value: CategoryManagementFormType) => {
    setRspErrorMsg("");
    console.log(value);
    setIsSaving(true);
    await new Promise((res) =>
      setTimeout(() => {
        res("success");
        AppToast.success({ message: "Update category successfully" });
      }, 2000),
    );
    setIsSaving(false);
    router.back();
  };

  useEffect(() => {
    setValues({
      typeId: 1,
      label: "Salary",
      icon: "Users",
    });
  }, [id]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView>
        <AppDialog
          title="Delete"
          description="Are you sure you want to delete this category?
                  Transactions associated with this category will not be affected."
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
        <View className="flex-1 p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer pb-0">
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
                options={TXN_TYPES_OPTIONS}
                errorField={error}
                editable={!isSubmitting}
                disabled={isSubmitting}
                showClear
              />
            )}
          />

          <View className="flex-row justify-around mb-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer gap-4">
            <View className="flex-[0.2] h-[80]">
              <Controller
                control={control}
                name="icon"
                render={({
                  field: { value, onChange, onBlur, ref },
                  fieldState: { error },
                }) => (
                  <AppIconSelect
                    ref={ref}
                    value={value as AppIconProps["name"]}
                    onChange={onChange}
                    error={error}
                    onBlur={onBlur}
                    icons={ICONS.CATEGORY_ICONS}
                    editable={!isSubmitting}
                    disabled={isSubmitting}
                  />
                )}
              />
            </View>
            <View className="flex-[0.8]">
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
                    disabled={isSubmitting}
                    onChangeText={onChange}
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
                editable={!isSubmitting}
                disabled={isSubmitting}
                onChangeText={onChange}
                onChange={onChange}
                onBlur={onBlur}
                value={value}
                maxLength={DESCRIPTION_MAX_LEN}
                showClear
                errorField={error}
                submitBehavior="submit"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <View className=" mt-0 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
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
        </View>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
