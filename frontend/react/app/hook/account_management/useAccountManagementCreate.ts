import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { AppIconProps } from "../../components/AppIcon";
import { AppToast } from "../../components/AppToast";
import {
  accountManagementQueryKeys,
  accountTypeQueryKeys,
  creditCardQueryKeys,
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
import { useTranslation } from "../../i18n/helper";
import useCurrencyPreferenceOptions from "../currency_management/useCurrencyPreferenceOptions";
import { reconcileAllCreditCards } from "../../sql/service/creditCardService";

export default function useAccountManagementCreate() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isSavingAndNewAcc, setIsSavingAndNewAcc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rspErrorMsg, setRspErrorMsg] = useState("");
  const isSubmitting = isSavingAndNewAcc || isSaving;
  const currencyPreferences = useCurrencyPreferenceOptions();
  const hasInitializedCurrency = useRef(false);

  const {
    control,
    handleSubmit,
    reset,
    setFocus,
    setValue,
    formState: { errors },
  } = useForm<AccountManagementFormType>({
    resolver: zodResolver(accountManagementFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: accountManagementFormDefaultValues,
  });

  useEffect(() => {
    if (!currencyPreferences.isFetched || hasInitializedCurrency.current)
      return;
    setValue("currencyCode", currencyPreferences.defaultCurrencyCode, {
      shouldValidate: true,
    });
    hasInitializedCurrency.current = true;
  }, [currencyPreferences, setValue]);

  const { data: accountTypes = [] } = useQuery({
    queryKey: accountTypeQueryKeys.list({ pageSize: ACCOUNT_TYPE_PAGE_SIZE }),
    queryFn: () => getAccTypeList(1, ACCOUNT_TYPE_PAGE_SIZE),
  });
  const accountTypeOptions = useMemo(
    () =>
      accountTypes.map((item) => ({
        id: item.id,
        icon: item.icon as AppIconProps["name"],
        label: item.is_system ? t(item.label) : item.label,
        value: item.id,
      })),
    [accountTypes, t],
  );
  const creditCardTypeId =
    accountTypes.find(
      (item) => item.is_system && item.label.toLowerCase() === "credit card",
    )?.id ?? "";

  const onSubmit = async (
    value: AccountManagementFormType,
    saveAnotherAcc: boolean,
  ) => {
    const setLoading = saveAnotherAcc ? setIsSavingAndNewAcc : setIsSaving;
    const isCreditCard = value.typeId === creditCardTypeId;
    const data = {
      ...value,
      currentBalance:
        isCreditCard && value.balancePosition === "debt"
          ? `-${value.currentBalance || "0"}`
          : value.currentBalance,
      reminderEnabled: isCreditCard && value.reminderEnabled,
      descriptions: value.descriptions?.trim(),
    };

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
      await reconcileAllCreditCards();

      await Promise.all([
        invalidateQuery(queryClient, accountManagementQueryKeys.lists()),
        invalidateQuery(queryClient, accountManagementQueryKeys.assetBalance()),
        invalidateQuery(queryClient, creditCardQueryKeys.cycles()),
      ]);
      debugLog(
        DEBUG_TAG.ACCOUNT_MANAGEMENT,
        "Invalidated account lists after create",
        { label: data.label },
      );
      AppToast.success({
        message: t("{{name}} account created successfully", {
          name: value.label,
        }),
      });
      reset({
        ...accountManagementFormDefaultValues,
        currencyCode: currencyPreferences.defaultCurrencyCode,
      });
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
    creditCardTypeId,
    control,
    currencyOptions: currencyPreferences.currencyOptions,
    errors,
    handleSubmit,
    isSaving,
    isSavingAndNewAcc,
    isSubmitting,
    onSubmit,
    rspErrorMsg,
    setFocus,
    setValue,
    showCurrencyField: currencyPreferences.showCurrencyField,
  };
}
