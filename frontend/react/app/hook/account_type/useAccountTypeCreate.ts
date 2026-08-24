import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
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
import { createNewAccType } from "../../sql/service/accTypeService";
import { toTitleCase } from "../../utils/text";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { useTranslation } from "../../i18n";

export default function useAccountTypeCreate() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<AppIconProps["name"]>(
    ICONS.ACCOUNT_TYPE[0],
  );
  const [isSavingAndNewType, setIsSavingAndNewType] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rspErrorMsg, setRspErrorMsg] = useState("");
  const isSubmitting = isSavingAndNewType || isSaving;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AccountTypeFormType>({
    resolver: zodResolver(accountTypeFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: accountTypeFormDefaultValues,
  });

  const formReset = () => {
    reset();
    setSelectedItem(ICONS.ACCOUNT_TYPE[0]);
  };

  const onSubmit = async (
    value: AccountTypeFormType,
    saveAnotherType: boolean,
  ) => {
    const data = {
      ...value,
      label: toTitleCase(value.label),
      icon: selectedItem,
    };
    const setLoading = saveAnotherType ? setIsSavingAndNewType : setIsSaving;

    try {
      setRspErrorMsg("");
      setLoading(true);
      const errMsg = await createNewAccType(data);
      if (errMsg) {
        debugLog(DEBUG_TAG.ACCOUNT_TYPE, "Create rejected by service", {
          label: data.label,
          reason: errMsg,
        });
        setRspErrorMsg(errMsg);
        return;
      }

      await invalidateQuery(queryClient, accountTypeQueryKeys.lists());
      debugLog(
        DEBUG_TAG.ACCOUNT_TYPE,
        "Invalidated account type lists after create",
        { label: data.label },
      );
      AppToast.success({
        message: t("{{name}} account type created successfully", {
          name: value.label,
        }),
      });
      formReset();
      if (!saveAnotherType) router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.ACCOUNT_TYPE,
        "Error when create new account type",
        e,
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    errors,
    handleSubmit,
    isSaving,
    isSavingAndNewType,
    isSubmitting,
    onSubmit,
    rspErrorMsg,
    selectedItem,
    setSelectedItem,
  };
}
