import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { AppIconProps } from "../../components/AppIcon";
import { AppToast } from "../../components/AppToast";
import {
  accountManagementQueryKeys,
  accountTypeQueryKeys,
  budgetQueryKeys,
  categoryManagementQueryKeys,
  invalidateQuery,
  transactionManagementQueryKeys,
  creditCardQueryKeys,
} from "../../constants/queryKeys";
import { ACCOUNT_TYPE_PAGE_SIZE } from "../../constants/size";
import {
  accountManagementFormDefaultValues,
  accountManagementFormSchema,
} from "../../forms/schemas/account_management.schema";
import type { AccountManagementFormType } from "../../forms/schemas/account_management.schema";
import {
  deleteAccMgmt,
  getAccMgmtById,
  updateAccMgmt,
} from "../../sql/service/accMgmtService";
import { getAccTypeList } from "../../sql/service/accTypeService";
import { getCategoryMgmtList } from "../../sql/service/categoryMgmtService";
import type { BalanceChangeKind } from "../../sql/types/accMgmtType";
import {
  compareAmounts,
  subtractAmounts,
  toAmountString,
} from "../../utils/amount";
import { formatDateValue } from "../../utils/date";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { useTranslation } from "../../i18n/helper";
import { getCategoryDisplayLabel } from "../category_management/categoryManagementList.utils";
import useCurrencyPreferenceOptions from "../currency_management/useCurrencyPreferenceOptions";
import {
  getCurrentCreditCardCycle,
  reconcileAllCreditCards,
} from "../../sql/service/creditCardService";

export default function useAccountManagementDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rspErrorMsg, setRspErrorMsg] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] =
    useState<AccountManagementFormType | null>(null);
  const [balanceChangeKind, setBalanceChangeKindState] = useState<
    BalanceChangeKind | undefined
  >();
  const [balanceChangeCategoryId, setBalanceChangeCategoryId] = useState("");
  const [balanceChangeDescription, setBalanceChangeDescription] = useState("");
  const [balanceChangeDate, setBalanceChangeDate] = useState(() =>
    formatDateValue(new Date()),
  );
  const isSubmitting = isDeleting || isSaving;

  const accountQuery = useQuery({
    queryKey: accountManagementQueryKeys.detail(id),
    queryFn: () => getAccMgmtById(id),
    enabled: Boolean(id),
  });
  const shouldLoadCurrentCycle = Boolean(
    id &&
    accountQuery.data?.type_label === "Credit Card" &&
    accountQuery.data.credit_card_reminder_enabled &&
    accountQuery.data.reminder_first_cycle_mode === "current",
  );
  const currentCycleQuery = useQuery({
    queryKey: creditCardQueryKeys.currentCycle(id),
    queryFn: () => getCurrentCreditCardCycle(id),
    enabled: shouldLoadCurrentCycle,
  });
  const currencyPreferences = useCurrencyPreferenceOptions(
    accountQuery.data?.currency_code,
  );
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

  const { control, handleSubmit, reset, setFocus, setValue, watch } =
    useForm<AccountManagementFormType>({
      resolver: zodResolver(accountManagementFormSchema),
      mode: "onChange",
      reValidateMode: "onChange",
      defaultValues: accountManagementFormDefaultValues,
    });
  const watchedBalance = watch("currentBalance");
  const selectedTypeId = watch("typeId");
  const balancePosition = watch("balancePosition");
  const currentBalance =
    selectedTypeId === creditCardTypeId && balancePosition === "debt"
      ? `-${watchedBalance || "0"}`
      : watchedBalance;
  const balanceDifference = accountQuery.data
    ? subtractAmounts(currentBalance, accountQuery.data.current_balance)
    : 0;
  const balanceDirection =
    compareAmounts(balanceDifference, 0) === 0
      ? undefined
      : compareAmounts(balanceDifference, 0) < 0
        ? "expense"
        : "income";
  const categoryTypeId =
    balanceChangeKind === "expense"
      ? 2
      : balanceChangeKind === "income"
        ? 1
        : 0;
  const { data: balanceChangeCategories = [] } = useQuery({
    queryKey: categoryManagementQueryKeys.list({
      typeId: categoryTypeId,
      pageSize: 100,
    }),
    queryFn: () => getCategoryMgmtList(categoryTypeId, 1, 100),
    enabled: categoryTypeId > 0,
  });
  const balanceChangeCategoryOptions = useMemo(
    () =>
      balanceChangeCategories.map((item) => ({
        id: item.id,
        icon: item.icon as AppIconProps["name"],
        label: getCategoryDisplayLabel(item.label, item.translation_key, t),
        value: item.id,
      })),
    [balanceChangeCategories, t],
  );
  const isBalanceChangeReady =
    compareAmounts(balanceDifference, 0) === 0 ||
    balanceChangeKind === "correction" ||
    Boolean(balanceChangeKind && balanceChangeCategoryId && balanceChangeDate);

  const setBalanceChangeKind = (kind: BalanceChangeKind) => {
    setBalanceChangeKindState(kind);
    setBalanceChangeCategoryId("");
    setBalanceChangeDescription("");
  };

  const saveAccount = async (value: AccountManagementFormType) => {
    const isCreditCard = value.typeId === creditCardTypeId;
    const data = {
      ...value,
      currentBalance:
        isCreditCard && value.balancePosition === "debt"
          ? `-${value.currentBalance || "0"}`
          : value.currentBalance,
      reminderEnabled: isCreditCard && value.reminderEnabled,
      id,
      descriptions: value.descriptions?.trim(),
      balanceChangeKind:
        compareAmounts(balanceDifference, 0) === 0
          ? undefined
          : balanceChangeKind,
      balanceChangeCategoryId:
        compareAmounts(balanceDifference, 0) === 0
          ? undefined
          : balanceChangeCategoryId,
      balanceChangeDate:
        compareAmounts(balanceDifference, 0) === 0
          ? undefined
          : balanceChangeDate,
      balanceChangeDescription:
        compareAmounts(balanceDifference, 0) === 0
          ? undefined
          : balanceChangeDescription.trim() || undefined,
    };
    try {
      setRspErrorMsg("");
      setIsSaving(true);
      const validationError = await updateAccMgmt(data);
      if (validationError) {
        debugLog(DEBUG_TAG.ACCOUNT_MANAGEMENT, "Update rejected by service", {
          id,
          label: data.label,
          reason: validationError,
        });
        setRspErrorMsg(validationError);
        return;
      }
      await reconcileAllCreditCards();
      await Promise.all([
        invalidateQuery(queryClient, accountManagementQueryKeys.lists()),
        invalidateQuery(queryClient, accountManagementQueryKeys.detail(id)),
        invalidateQuery(queryClient, accountManagementQueryKeys.assetBalance()),
        invalidateQuery(queryClient, transactionManagementQueryKeys.lists()),
        invalidateQuery(queryClient, categoryManagementQueryKeys.lists()),
        invalidateQuery(queryClient, budgetQueryKeys.months()),
        invalidateQuery(queryClient, creditCardQueryKeys.cycles()),
      ]);
      debugLog(
        DEBUG_TAG.ACCOUNT_MANAGEMENT,
        "Invalidated account queries after update",
        { id },
      );
      AppToast.success({ message: "Account updated successfully" });
      router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.ACCOUNT_MANAGEMENT,
        "Error when updating account",
        e,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (value: AccountManagementFormType) => {
    if (accountQuery.data?.is_active && !value.isActive) {
      setPendingUpdate(value);
      setShowDeactivateDialog(true);
      return;
    }
    await saveAccount(value);
  };

  const confirmDeactivate = async () => {
    const value = pendingUpdate;
    setShowDeactivateDialog(false);
    setPendingUpdate(null);
    if (value) await saveAccount(value);
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAccMgmt(id);
      await Promise.all([
        invalidateQuery(queryClient, accountManagementQueryKeys.lists()),
        invalidateQuery(queryClient, accountManagementQueryKeys.assetBalance()),
        invalidateQuery(queryClient, creditCardQueryKeys.cycles()),
      ]);
      queryClient.removeQueries({
        queryKey: accountManagementQueryKeys.detail(id),
      });
      debugLog(
        DEBUG_TAG.ACCOUNT_MANAGEMENT,
        "Invalidated list and removed detail after delete",
        { id },
      );
      AppToast.success({ message: "Account deleted successfully" });
      router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.ACCOUNT_MANAGEMENT,
        "Error when deleting account",
        e,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    setBalanceChangeKindState(undefined);
    setBalanceChangeCategoryId("");
    setBalanceChangeDescription("");
  }, [balanceDirection]);

  useEffect(() => {
    if (
      !accountQuery.data ||
      (shouldLoadCurrentCycle && currentCycleQuery.isLoading)
    )
      return;
    const firstCycleMode =
      accountQuery.data.reminder_first_cycle_mode ?? "next";
    const savedCurrentCycle =
      firstCycleMode === "current" ? currentCycleQuery.data : undefined;
    reset({
      typeId: accountQuery.data.type_id,
      currencyCode: accountQuery.data.currency_code,
      label: accountQuery.data.label,
      descriptions: accountQuery.data.descriptions ?? "",
      currentBalance: toAmountString(
        Math.abs(accountQuery.data.current_balance),
        accountQuery.data.currency_code,
      ),
      balancePosition:
        accountQuery.data.current_balance < 0 ? "debt" : "overpayment",
      reminderEnabled: Boolean(accountQuery.data.credit_card_reminder_enabled),
      statementDay: String(accountQuery.data.statement_day ?? 20),
      dueDay: String(accountQuery.data.due_day ?? 28),
      reminderLeadDays: String(accountQuery.data.reminder_lead_days ?? 3),
      reminderTime: accountQuery.data.reminder_time ?? "09:00",
      reminderStopCondition:
        accountQuery.data.reminder_stop_condition ?? "full",
      firstCycleMode,
      currentCycleRemainingDue: savedCurrentCycle
        ? toAmountString(
            savedCurrentCycle.statement_amount,
            accountQuery.data.currency_code,
          )
        : "0",
      currentCycleDueDate: savedCurrentCycle?.due_date ?? "",
      isActive: Boolean(accountQuery.data.is_active),
      isAsset: Boolean(accountQuery.data.is_asset),
    });
  }, [
    accountQuery.data,
    currentCycleQuery.data,
    currentCycleQuery.isLoading,
    reset,
    shouldLoadCurrentCycle,
  ]);

  useEffect(() => {
    if (accountQuery.isLoading || accountQuery.data !== null) return;
    console.warn("Account id not found", { id });
    AppToast.error({ message: "Account id not found" });
  }, [accountQuery.data, accountQuery.isLoading, id]);

  useEffect(() => {
    if (!accountQuery.error) return;
    console.error(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Error when getting account by id",
      accountQuery.error,
    );
  }, [accountQuery.error]);

  return {
    accountTypeOptions,
    creditCardTypeId,
    balanceChangeCategoryId,
    balanceChangeCategoryOptions,
    balanceChangeDate,
    balanceChangeDescription,
    balanceChangeKind,
    balanceDifference,
    control,
    confirmDeactivate,
    currencyOptions: currencyPreferences.currencyOptions,
    handleSubmit,
    isDeleting,
    isBalanceChangeReady,
    isLoading: accountQuery.isLoading,
    isSaving,
    isSubmitting,
    onDelete,
    onSubmit,
    rspErrorMsg,
    setFocus,
    setValue,
    setBalanceChangeCategoryId,
    setBalanceChangeDate,
    setBalanceChangeDescription,
    setBalanceChangeKind,
    setShowDeactivateDialog,
    setShowDeleteDialog,
    showCurrencyField: currencyPreferences.showCurrencyField,
    showDeactivateDialog,
    showDeleteDialog,
  };
}
