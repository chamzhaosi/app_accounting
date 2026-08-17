import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { AppIconProps } from "../../components/AppIcon";
import { AppToast } from "../../components/AppToast";
import { ICONS } from "../../constants/icons";
import {
  accountTypeQueryKeys,
  invalidateQuery,
} from "../../constants/queryKeys";
import {
  accountTypeFormDefaultValues,
  accountTypeFormSchema,
} from "../../forms/schemas/accout_type.schema";
import type { AccountTypeFormType } from "../../forms/schemas/accout_type.schema";
import {
  deleteAccType,
  getAccTypeById,
  updateAccType,
} from "../../sql/service/accTypeService";
import { toTitleCase } from "../../utils/text";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

export default function useAccountTypeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<AppIconProps["name"]>(
    ICONS.ACCOUNT_TYPE[0],
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rspErrorMsg, setRspErrorMsg] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const isSubmitting = isDeleting || isSaving;

  const {
    data: accountType,
    error,
    isLoading,
  } = useQuery({
    queryKey: accountTypeQueryKeys.detail(id),
    queryFn: () => getAccTypeById(id),
    enabled: Boolean(id),
  });

  const { control, handleSubmit, reset } = useForm<AccountTypeFormType>({
    resolver: zodResolver(accountTypeFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: accountTypeFormDefaultValues,
  });

  const onSubmit = async (value: AccountTypeFormType) => {
    const data = {
      ...value,
      id,
      label: toTitleCase(value.label),
      icon: selectedItem,
    };

    try {
      setRspErrorMsg("");
      setIsSaving(true);
      const validationError = await updateAccType(data);
      if (validationError) {
        debugLog(DEBUG_TAG.ACCOUNT_TYPE, "Update rejected by service", {
          id,
          label: data.label,
          reason: validationError,
        });
        setRspErrorMsg(validationError);
        return;
      }

      await Promise.all([
        invalidateQuery(queryClient, accountTypeQueryKeys.lists()),
        invalidateQuery(queryClient, accountTypeQueryKeys.detail(id)),
      ]);
      debugLog(
        DEBUG_TAG.ACCOUNT_TYPE,
        "Invalidated account type queries after update",
        { id },
      );
      AppToast.success({ message: "Account type updated successfully" });
      router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.ACCOUNT_TYPE,
        "Error when updating account type",
        e,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAccType(id);
      await invalidateQuery(queryClient, accountTypeQueryKeys.lists());
      queryClient.removeQueries({ queryKey: accountTypeQueryKeys.detail(id) });
      debugLog(
        DEBUG_TAG.ACCOUNT_TYPE,
        "Invalidated list and removed detail after delete",
        { id },
      );
      AppToast.success({ message: "Account type deleted successfully" });
      router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.ACCOUNT_TYPE,
        "Error when deleting account type",
        e,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!accountType) return;
    reset({ label: accountType.label, icon: accountType.icon });
    setSelectedItem(accountType.icon as AppIconProps["name"]);
  }, [accountType, reset]);

  useEffect(() => {
    if (isLoading || accountType !== null) return;
    console.warn("Account type id not found", { id });
    AppToast.error({ message: "Accout type id not found" });
  }, [accountType, id, isLoading]);

  useEffect(() => {
    if (!error) return;
    console.error(
      DEBUG_TAG.ACCOUNT_TYPE,
      "Error when getting account type by id",
      error,
    );
  }, [error]);

  return {
    control,
    handleSubmit,
    isDeleting,
    isLoading,
    isSaving,
    isSubmitting,
    onDelete,
    onSubmit,
    rspErrorMsg,
    selectedItem,
    setSelectedItem,
    setShowDialog,
    showDialog,
  };
}
