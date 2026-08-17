import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AppToast } from "../../components/AppToast";
import { CATEGORY_TRANSACTION_TYPE_OPTIONS } from "../../constants/options";
import {
  categoryManagementQueryKeys,
  invalidateQuery,
} from "../../constants/queryKeys";
import {
  categoryManagementFormDefaultValues,
  categoryManagementFormSchema,
} from "../../forms/schemas/category_management.schema";
import type { CategoryManagementFormType } from "../../forms/schemas/category_management.schema";
import { createNewCategoryMgmt } from "../../sql/service/categoryMgmtService";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

const getInitialValues = (type?: string): CategoryManagementFormType => ({
  ...categoryManagementFormDefaultValues,
  typeId: Number(
    CATEGORY_TRANSACTION_TYPE_OPTIONS.find((option) => option.value === type)
      ?.id ?? 1,
  ),
});

export default function useCategoryManagementCreate() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const queryClient = useQueryClient();
  const [isSavingAndNew, setIsSavingAndNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rspErrorMsg, setRspErrorMsg] = useState("");
  const isSubmitting = isSavingAndNew || isSaving;
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

  const onSubmit = async (
    value: CategoryManagementFormType,
    saveAnother: boolean,
  ) => {
    const setLoading = saveAnother ? setIsSavingAndNew : setIsSaving;
    const data = { ...value, descriptions: value.descriptions?.trim() };
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
      if (saveAnother) reset(getInitialValues(type));
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

  return {
    control,
    errors,
    handleSubmit,
    isSaving,
    isSavingAndNew,
    isSubmitting,
    onSubmit,
    rspErrorMsg,
    setFocus,
  };
}
