import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { AppIconProps } from "../../components/AppIcon";
import { AppToast } from "../../components/AppToast";
import {
  accountManagementQueryKeys,
  accountTypeQueryKeys,
  invalidateQuery,
} from "../../constants/queryKeys";
import { ACCOUNT_TYPE_PAGE_SIZE } from "../../constants/size";
import {
  accountManagementFormDefaultValues,
  accountManagementFormSchema,
} from "../../forms/schemas/account_management.schema";
import type { AccountManagementFormType } from "../../forms/schemas/account_management.schema";
import { createNewAccMgmt } from "../../sql/service/accMgmtService";
import { getAccTypeList } from "../../sql/service/accTypeService";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

export default function useAccountManagementCreate() {
  const queryClient = useQueryClient();
  const [isSavingAndNewAcc, setIsSavingAndNewAcc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rspErrorMsg, setRspErrorMsg] = useState("");
  const isSubmitting = isSavingAndNewAcc || isSaving;

  const {
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<AccountManagementFormType>({
    resolver: zodResolver(accountManagementFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: accountManagementFormDefaultValues,
  });

  const { data: accountTypes = [] } = useQuery({
    queryKey: accountTypeQueryKeys.list({ pageSize: ACCOUNT_TYPE_PAGE_SIZE }),
    queryFn: () => getAccTypeList(1, ACCOUNT_TYPE_PAGE_SIZE),
  });
  const accountTypeOptions = useMemo(
    () =>
      accountTypes.map((item) => ({
        id: item.id,
        icon: item.icon as AppIconProps["name"],
        label: item.label,
        value: item.id,
      })),
    [accountTypes],
  );

  const onSubmit = async (
    value: AccountManagementFormType,
    saveAnotherAcc: boolean,
  ) => {
    const setLoading = saveAnotherAcc ? setIsSavingAndNewAcc : setIsSaving;
    const data = { ...value, descriptions: value.descriptions?.trim() };

    try {
      setRspErrorMsg("");
      setLoading(true);
      const errMsg = await createNewAccMgmt(data);
      if (errMsg) {
        debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT, "Create rejected by service", {
          label: data.label,
          reason: errMsg,
        });
        setRspErrorMsg(errMsg);
        return;
      }

      await Promise.all([
        invalidateQuery(queryClient, accountManagementQueryKeys.lists()),
        invalidateQuery(queryClient, accountManagementQueryKeys.mainBalance()),
      ]);
      debugLog(
        DEBUG_TAG.ACCOUNT_MANAGEMENT,
        "Invalidated account lists after create",
        { label: data.label },
      );
      AppToast.success({
        message: `${value.label} account created successfully`,
      });
      reset();
      if (!saveAnotherAcc) router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.ACCOUNT_MANAGEMENT,
        "Error when create new account",
        e,
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    accountTypeOptions,
    control,
    errors,
    handleSubmit,
    isSaving,
    isSavingAndNewAcc,
    isSubmitting,
    onSubmit,
    rspErrorMsg,
    setFocus,
  };
}
