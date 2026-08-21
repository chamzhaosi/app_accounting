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
import { formatDateValue } from "../../utils/date";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

export default function useAccountManagementDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rspErrorMsg, setRspErrorMsg] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [balanceChangeKind, setBalanceChangeKindState] = useState<
    BalanceChangeKind | undefined
  >();
  const [balanceChangeCategoryId, setBalanceChangeCategoryId] = useState("");
  const [balanceChangeDate, setBalanceChangeDate] = useState(() =>
    formatDateValue(new Date()),
  );
  const isSubmitting = isDeleting || isSaving;

  const accountQuery = useQuery({
    queryKey: accountManagementQueryKeys.detail(id),
    queryFn: () => getAccMgmtById(id),
    enabled: Boolean(id),
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

  const { control, handleSubmit, reset, setFocus, watch } =
    useForm<AccountManagementFormType>({
      resolver: zodResolver(accountManagementFormSchema),
      mode: "onChange",
      reValidateMode: "onChange",
      defaultValues: accountManagementFormDefaultValues,
    });
  const currentBalance = watch("currentBalance");
  const balanceDifference = accountQuery.data
    ? Math.round(
        (Number(currentBalance ?? 0) - accountQuery.data.current_balance) * 100,
      ) / 100
    : 0;
  const balanceDirection =
    balanceDifference === 0
      ? undefined
      : balanceDifference < 0
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
        label: item.label,
        value: item.id,
      })),
    [balanceChangeCategories],
  );
  const isBalanceChangeReady =
    balanceDifference === 0 ||
    balanceChangeKind === "correction" ||
    Boolean(balanceChangeKind && balanceChangeCategoryId && balanceChangeDate);

  const setBalanceChangeKind = (kind: BalanceChangeKind) => {
    setBalanceChangeKindState(kind);
    setBalanceChangeCategoryId("");
  };

  const onSubmit = async (value: AccountManagementFormType) => {
    const data = {
      ...value,
      id,
      descriptions: value.descriptions?.trim(),
      balanceChangeKind:
        balanceDifference === 0 ? undefined : balanceChangeKind,
      balanceChangeCategoryId:
        balanceDifference === 0 ? undefined : balanceChangeCategoryId,
      balanceChangeDate:
        balanceDifference === 0 ? undefined : balanceChangeDate,
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
      await Promise.all([
        invalidateQuery(queryClient, accountManagementQueryKeys.lists()),
        invalidateQuery(queryClient, accountManagementQueryKeys.detail(id)),
        invalidateQuery(queryClient, accountManagementQueryKeys.mainBalance()),
        invalidateQuery(queryClient, transactionManagementQueryKeys.lists()),
        invalidateQuery(queryClient, categoryManagementQueryKeys.lists()),
        invalidateQuery(queryClient, budgetQueryKeys.months()),
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

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAccMgmt(id);
      await Promise.all([
        invalidateQuery(queryClient, accountManagementQueryKeys.lists()),
        invalidateQuery(queryClient, accountManagementQueryKeys.mainBalance()),
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
  }, [balanceDirection]);

  useEffect(() => {
    if (!accountQuery.data) return;
    reset({
      typeId: accountQuery.data.type_id,
      label: accountQuery.data.label,
      descriptions: accountQuery.data.descriptions ?? "",
      currentBalance: accountQuery.data.current_balance.toFixed(2),
      isMainAccount: Boolean(accountQuery.data.is_main_account),
    });
  }, [accountQuery.data, reset]);

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
    balanceChangeCategoryId,
    balanceChangeCategoryOptions,
    balanceChangeDate,
    balanceChangeKind,
    balanceDifference,
    control,
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
    setBalanceChangeCategoryId,
    setBalanceChangeDate,
    setBalanceChangeKind,
    setShowDialog,
    showDialog,
  };
}
