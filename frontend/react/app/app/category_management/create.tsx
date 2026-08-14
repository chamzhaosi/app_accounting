import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { AppIconProps } from "../../components/AppIcon";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppIconSelect from "../../components/AppIconSelect";
import AppSelect, { SelectOptionType } from "../../components/AppSelect";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import { AppToast } from "../../components/AppToast";
import AppView from "../../components/AppView";
import { ICONS } from "../../constants/icons";
import {
  categoryManagementQueryKeys,
  invalidateQuery,
} from "../../constants/queryKeys";
import {
  categoryManagementFormDefaultValues,
  categoryManagementFormSchema,
  CategoryManagementFormType,
  DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN,
} from "../../forms/schemas/category_management.schema";
import { createNewCategoryMgmt } from "../../sql/service/categoryMgmtService";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

const TXN_TYPES_OPTIONS: SelectOptionType[] = [
  { id: 1, label: "Income", value: "inc" },
  { id: 2, label: "Expense", value: "exp" },
];

const getInitialValues = (type?: string): CategoryManagementFormType => ({
  ...categoryManagementFormDefaultValues,
  typeId: Number(
    TXN_TYPES_OPTIONS.find((txnType) => txnType.value === type)?.id ?? 1,
  ),
});

export default function CategoryManagementCreate() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const queryClient = useQueryClient();

  const [isSavingAndNewAcc, setIsSavingAndNewAcc] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");
  const isSubmitting = isSavingAndNewAcc || isSaving;

  const {
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<CategoryManagementFormType>({
    resolver: zodResolver(categoryManagementFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: categoryManagementFormDefaultValues,
  });

  const formReset = () => {
    reset(getInitialValues(type));
  };

  const onSubmit = async (
    value: CategoryManagementFormType,
    saveAnotherAcc: boolean,
  ) => {
    const setLoading = saveAnotherAcc ? setIsSavingAndNewAcc : setIsSaving;
    const data = {
      ...value,
      descriptions: value.descriptions?.trim(),
    };

    try {
      setRspErrorMsg("");
      setLoading(true);
      const errMsg = await createNewCategoryMgmt(data);
      if (errMsg) {
        debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT, "Create rejected by service", {
          typeId: data.typeId,
          label: data.label,
          reason: errMsg,
        });
        setRspErrorMsg(errMsg);
        return;
      }

      await invalidateQuery(queryClient, categoryManagementQueryKeys.lists());
      debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT, "Invalidated category lists", {
        typeId: data.typeId,
        label: data.label,
      });
      AppToast.success({ message: "Add category successfully" });
      if (saveAnotherAcc) formReset();
      else router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.CATEGORY_MANAGEMENT,
        "Error when creating category",
        e,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reset(getInitialValues(type));
  }, [reset, type]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView className="flex-1 p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer pb-0">
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
              value={value?.toString() ?? ""}
              onChange={(selected) => onChange(Number(selected ?? 0))}
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
              onBlur={onBlur}
              value={value}
              maxLength={DESCRIPTION_MAX_LEN}
              showClear
              errorField={error}
              submitBehavior="submit"
              onSubmitEditing={handleSubmit((value) => onSubmit(value, false))}
            />
          )}
        />

        <View className=" mt-0 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
          <View className="flex-row items-center justify-center gap-4 mt-4">
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
          {rspErrorMsg && (
            <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
          )}
        </View>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
