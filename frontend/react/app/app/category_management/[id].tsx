import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { AppIconProps } from "../../components/AppIcon";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDialog from "../../components/AppDialog";
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
import { DIALOG_COMMON_BTN_PROPS } from "../../constants/size";
import {
  categoryManagementFormDefaultValues,
  categoryManagementFormSchema,
  CategoryManagementFormType,
  DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN,
} from "../../forms/schemas/category_management.schema";
import {
  deleteCategoryMgmt,
  getCategoryMgmtById,
  updateCategoryMgmt,
} from "../../sql/service/categoryMgmtService";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { ActivityIndicator } from "react-native-paper";

const TXN_TYPES_OPTIONS: SelectOptionType[] = [
  { id: 1, label: "Income", value: "inc" },
  { id: 2, label: "Expense", value: "exp" },
];

export default function CategoryManagementDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [rspErrorMsg, setRspErrorMsg] = useState<string>("");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const isSubmitting = isDeleting || isSaving;

  const {
    data: category,
    error,
    isLoading,
  } = useQuery({
    queryKey: categoryManagementQueryKeys.detail(id),
    queryFn: () => getCategoryMgmtById(id),
    enabled: Boolean(id),
  });

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

  const onDelete = async () => {
    try {
      setRspErrorMsg("");
      setIsDeleting(true);
      const errMsg = await deleteCategoryMgmt(id);
      if (errMsg) {
        debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT, "Delete rejected by service", {
          id,
          reason: errMsg,
        });
        setRspErrorMsg(errMsg);
        return;
      }

      await invalidateQuery(queryClient, categoryManagementQueryKeys.lists());
      queryClient.removeQueries({
        queryKey: categoryManagementQueryKeys.detail(id),
      });
      debugLog(
        DEBUG_TAG.CATEGORY_MANAGEMENT,
        "Invalidated list and removed detail after delete",
        { id },
      );
      AppToast.success({ message: "Category deleted successfully" });
      router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.CATEGORY_MANAGEMENT,
        "Error when deleting category",
        e,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = async (value: CategoryManagementFormType) => {
    const data = {
      ...value,
      id,
      descriptions: value.descriptions?.trim(),
    };

    try {
      setRspErrorMsg("");
      setIsSaving(true);
      const errMsg = await updateCategoryMgmt(data);
      if (errMsg) {
        debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT, "Update rejected by service", {
          id,
          typeId: data.typeId,
          label: data.label,
          reason: errMsg,
        });
        setRspErrorMsg(errMsg);
        return;
      }

      await Promise.all([
        invalidateQuery(queryClient, categoryManagementQueryKeys.lists()),
        invalidateQuery(queryClient, categoryManagementQueryKeys.detail(id)),
      ]);
      debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT, "Invalidated category queries", {
        id,
      });
      AppToast.success({ message: "Update category successfully" });
      router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.CATEGORY_MANAGEMENT,
        "Error when updating category",
        e,
      );
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!category) return;

    reset({
      typeId: category.type_id,
      label: category.label,
      icon: category.icon,
      descriptions: category.descriptions ?? "",
    });
  }, [category, reset]);

  useEffect(() => {
    if (isLoading || category !== null) return;

    console.warn(DEBUG_TAG.CATEGORY_MANAGEMENT, "Category id not found", {
      id,
    });
    AppToast.error({ message: "Category id not found" });
  }, [category, id, isLoading]);

  useEffect(() => {
    if (!error) return;

    console.error(
      DEBUG_TAG.CATEGORY_MANAGEMENT,
      "Error when getting category by id",
      error,
    );
  }, [error]);

  if (isLoading) {
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
