import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AppToast } from "../../components/AppToast";
import {
  categoryManagementQueryKeys,
  invalidateQuery,
} from "../../constants/queryKeys";
import {
  categoryManagementFormDefaultValues,
  categoryManagementFormSchema,
} from "../../forms/schemas/category_management.schema";
import type { CategoryManagementFormType } from "../../forms/schemas/category_management.schema";
import {
  deleteCategoryMgmt,
  getCategoryMgmtById,
  updateCategoryMgmt,
} from "../../sql/service/categoryMgmtService";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { useTranslation } from "../../i18n/helper";
import {
  getCategoryDisplayDescription,
  getCategoryDisplayLabel,
} from "./categoryManagementList.utils";

export default function useCategoryManagementDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rspErrorMsg, setRspErrorMsg] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const isSubmitting = isDeleting || isSaving;

  const query = useQuery({
    queryKey: categoryManagementQueryKeys.detail(id),
    queryFn: () => getCategoryMgmtById(id),
    enabled: Boolean(id),
  });

  const {
    control,
    formState: { dirtyFields },
    handleSubmit,
    reset,
    setFocus,
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
    const isLabelCustomized = Boolean(dirtyFields.label);
    const data = {
      ...value,
      id,
      label: isLabelCustomized || !query.data ? value.label : query.data.label,
      descriptions:
        dirtyFields.descriptions || !query.data
          ? value.descriptions?.trim()
          : (query.data.descriptions ?? undefined),
      isLabelCustomized,
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
    if (query.data)
      reset({
        typeId: query.data.type_id,
        label: getCategoryDisplayLabel(
          query.data.label,
          query.data.translation_key,
          t,
        ),
        icon: query.data.icon,
        descriptions:
          getCategoryDisplayDescription(
            query.data.descriptions,
            query.data.translation_key,
            t,
          ) ?? "",
      });
  }, [query.data, reset, t]);

  useEffect(() => {
    if (!query.isLoading && query.data === null) {
      console.warn(DEBUG_TAG.CATEGORY_MANAGEMENT, "Category id not found", {
        id,
      });
      AppToast.error({ message: "Category id not found" });
    }
  }, [id, query.data, query.isLoading]);

  useEffect(() => {
    if (query.error)
      console.error(
        DEBUG_TAG.CATEGORY_MANAGEMENT,
        "Error when getting category by id",
        query.error,
      );
  }, [query.error]);

  return {
    control,
    handleSubmit,
    isDeleting,
    isLoading: query.isLoading,
    isSaving,
    isSubmitting,
    onDelete,
    onSubmit,
    rspErrorMsg,
    setFocus,
    setShowDialog,
    showDialog,
  };
}
