import { zodResolver } from "@hookform/resolvers/zod";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Keyboard } from "react-native";
import type {
  AccountFieldName,
  AccountPickerItemType,
} from "../../app/transaction_management/_components/AccountIdField";
import type { AppIconProps } from "../../components/AppIcon";
import type { AppListCardItemType } from "../../components/AppListCardView";
import { AppToast } from "../../components/AppToast";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import { TRANSACTION_CATEGORY_TYPE_IDS } from "../../constants/options";
import {
  accountManagementQueryKeys,
  budgetQueryKeys,
  categoryManagementQueryKeys,
  invalidateQuery,
  transactionManagementQueryKeys,
} from "../../constants/queryKeys";
import {
  ACCOUNT_MANAGEMENT_LIST_URL,
  CATEGORY_MANAGEMENT_LIST_URL,
} from "../../constants/urls";
import { DEFAULT_PAGE_SIZE } from "../../constants/size";
import {
  getTransactionManagementFormDefaultValues,
  transactionManagementFormSchema,
} from "../../forms/schemas/transaction_management.schema";
import type { TransactionManagementFormType } from "../../forms/schemas/transaction_management.schema";
import { getAccMgmtList } from "../../sql/service/accMgmtService";
import { getCategoryMgmtList } from "../../sql/service/categoryMgmtService";
import {
  deleteTransactionMgmt,
  getTransactionMgmtById,
  updateTransactionMgmt,
} from "../../sql/service/transactionMgmtService";
import { DEBUG_TAG } from "../../utils/debugLog";
import { useTranslation } from "../../i18n";
import {
  getCategoryDisplayDescription,
  getCategoryDisplayLabel,
} from "../../utils/category";

export default function useTransactionManagementDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isAccountPickerVisible, setIsAccountPickerVisible] = useState(false);
  const [activeAccountField, setActiveAccountField] =
    useState<AccountFieldName>("accountId");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const reopenAccountPickerOnFocus = useRef(false);
  const refreshCategoriesOnFocus = useRef(false);
  const isSubmitting = isDeleting || isSaving;

  const {
    data: transaction,
    error: transactionError,
    isLoading: isLoadingTransaction,
  } = useQuery({
    queryKey: transactionManagementQueryKeys.detail(id),
    queryFn: () => getTransactionMgmtById(id),
    enabled: Boolean(id),
  });

  const {
    clearErrors,
    control,
    handleSubmit,
    reset,
    setFocus,
    setValue,
    watch,
  } = useForm<TransactionManagementFormType>({
    resolver: zodResolver(transactionManagementFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: getTransactionManagementFormDefaultValues(
      dayjs().format("YYYY-MM-DD"),
    ),
  });

  const transactionType = watch("transactionType");
  const categoryTypeId = TRANSACTION_CATEGORY_TYPE_IDS[transactionType];

  const {
    data: categories,
    error: categoryError,
    fetchNextPage: fetchNextCategoryPage,
    hasNextPage: hasNextCategoryPage,
    isFetchingNextPage: isFetchingNextCategoryPage,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useInfiniteQuery({
    queryKey: categoryManagementQueryKeys.list({
      typeId: categoryTypeId ?? 0,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    queryFn: ({ pageParam }) =>
      getCategoryMgmtList(categoryTypeId!, pageParam, DEFAULT_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === DEFAULT_PAGE_SIZE ? allPages.length + 1 : undefined,
    enabled: categoryTypeId !== null,
  });

  const {
    data: accounts,
    error: accountError,
    fetchNextPage: fetchNextAccountPage,
    hasNextPage: hasNextAccountPage,
    isFetchingNextPage: isFetchingNextAccountPage,
    isLoading: isLoadingAccounts,
    isRefetching: isRefetchingAccounts,
    refetch: refetchAccounts,
  } = useInfiniteQuery({
    queryKey: accountManagementQueryKeys.list({
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    queryFn: ({ pageParam }) => getAccMgmtList(pageParam, DEFAULT_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === DEFAULT_PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const categoryItems = useMemo<AppListCardItemType[]>(() => {
    const items =
      categories?.pages.flat().map((category) => ({
        id: category.id.toString(),
        icon: category.icon as AppIconProps["name"],
        label: getCategoryDisplayLabel(
          category.label,
          category.translation_key,
          t,
        ),
        description: getCategoryDisplayDescription(
          category.descriptions,
          category.translation_key,
          t,
        ),
      })) ?? [];
    const savedCategoryId = transaction?.category_id;

    if (
      !savedCategoryId ||
      transaction.transaction_type !== transactionType ||
      items.some((category) => category.id.toString() === savedCategoryId)
    ) {
      return items;
    }

    return [
      {
        id: savedCategoryId,
        icon: (transaction.category_icon ?? "Tag") as AppIconProps["name"],
        label: getCategoryDisplayLabel(
          transaction.category_label ?? "Selected Category",
          transaction.category_translation_key,
          t,
        ),
      },
      ...items,
    ];
  }, [categories, t, transaction, transactionType]);

  const accountItems = useMemo<AccountPickerItemType[]>(
    () =>
      accounts?.pages.flat().map((account) => ({
        id: account.id,
        icon: account.type_icon as AppIconProps["name"],
        label: account.label,
        balance: account.current_balance,
        inputLabel: account.label,
        descriptions: account.descriptions ?? undefined,
      })) ?? [],
    [accounts],
  );

  const onLoadMoreCategories = () => {
    if (isFetchingNextCategoryPage || !hasNextCategoryPage) return;
    void fetchNextCategoryPage();
  };

  const onLoadMoreAccounts = () => {
    if (isFetchingNextAccountPage || !hasNextAccountPage) return;
    void fetchNextAccountPage();
  };

  const openAccountPicker = (fieldName: AccountFieldName) => {
    setActiveAccountField(fieldName);
    setIsAccountPickerVisible(true);
  };

  const onManageAccounts = () => {
    reopenAccountPickerOnFocus.current = true;
    setIsAccountPickerVisible(false);
    router.push(ACCOUNT_MANAGEMENT_LIST_URL);
  };

  const onManageCategories = () => {
    refreshCategoriesOnFocus.current = true;
    router.push({
      pathname: CATEGORY_MANAGEMENT_LIST_URL,
      params: {
        type: transactionType === TXN_TYPE_ENUM.INCOME ? "inc" : "exp",
      },
    });
  };

  const accountFieldProps = {
    accountItems,
    control,
    error: accountError,
    isFetchingNextPage: isFetchingNextAccountPage,
    isLoading: isLoadingAccounts,
    isRefreshing: isRefetchingAccounts,
    onDismissPicker: () => setIsAccountPickerVisible(false),
    onLoadMore: onLoadMoreAccounts,
    onManageAccounts,
    onRefresh: refetchAccounts,
  };

  useFocusEffect(
    useCallback(() => {
      if (reopenAccountPickerOnFocus.current) {
        reopenAccountPickerOnFocus.current = false;
        setIsAccountPickerVisible(true);
        void refetchAccounts();
      }

      if (refreshCategoriesOnFocus.current) {
        refreshCategoriesOnFocus.current = false;
        void refetchCategories();
      }
    }, [refetchAccounts, refetchCategories]),
  );

  useEffect(() => {
    if (!transaction) return;

    reset({
      transactionType: transaction.transaction_type,
      categoryId: transaction.category_id ?? "",
      accountId: transaction.account_id ?? "",
      fromAccountId: transaction.from_account_id ?? "",
      toAccountId: transaction.to_account_id ?? "",
      amount: transaction.amount.toFixed(2),
      description: transaction.descriptions ?? "",
      transactionDate: transaction.transaction_date,
    });
  }, [reset, transaction]);

  useEffect(() => {
    if (!transactionError) return;
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Error when getting transaction detail",
      transactionError,
    );
  }, [transactionError]);

  useEffect(() => {
    if (isLoadingTransaction || transaction !== null) return;
    AppToast.error({ message: "Transaction not found." });
    router.back();
  }, [isLoadingTransaction, transaction]);

  const onSubmit = async (value: TransactionManagementFormType) => {
    try {
      Keyboard.dismiss();
      setResponseError("");
      setIsSaving(true);
      const errorMessage = await updateTransactionMgmt({
        ...value,
        id,
        description: value.description?.trim(),
      });

      if (errorMessage) {
        setResponseError(errorMessage);
        return;
      }

      await Promise.all([
        invalidateQuery(queryClient, transactionManagementQueryKeys.lists()),
        invalidateQuery(queryClient, transactionManagementQueryKeys.detail(id)),
        invalidateQuery(queryClient, accountManagementQueryKeys.all),
        invalidateQuery(queryClient, categoryManagementQueryKeys.lists()),
        invalidateQuery(queryClient, budgetQueryKeys.months()),
      ]);
      AppToast.success({ message: "Transaction updated successfully" });
      router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.TRANSACTION_MANAGEMENT,
        "Error when updating transaction",
        e,
      );
      AppToast.error({ message: "Unable to update transaction." });
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    try {
      setResponseError("");
      setIsDeleting(true);
      const errorMessage = await deleteTransactionMgmt(id);

      if (errorMessage) {
        setResponseError(errorMessage);
        return;
      }

      await Promise.all([
        invalidateQuery(queryClient, transactionManagementQueryKeys.lists()),
        invalidateQuery(queryClient, accountManagementQueryKeys.all),
        invalidateQuery(queryClient, categoryManagementQueryKeys.lists()),
        invalidateQuery(queryClient, budgetQueryKeys.months()),
      ]);
      queryClient.removeQueries({
        queryKey: transactionManagementQueryKeys.detail(id),
      });
      AppToast.success({ message: "Transaction deleted successfully" });
      router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.TRANSACTION_MANAGEMENT,
        "Error when deleting transaction",
        e,
      );
      AppToast.error({ message: "Unable to delete transaction." });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    accountFieldProps,
    activeAccountField,
    categoryError,
    categoryItems,
    clearErrors,
    control,
    handleSubmit,
    isAccountPickerVisible,
    isDeleting,
    isFetchingNextCategoryPage,
    isLoadingCategories,
    isLoadingTransaction,
    isSaving,
    isSubmitting,
    onDelete,
    onLoadMoreCategories,
    onManageCategories,
    onSubmit,
    openAccountPicker,
    responseError,
    setFocus,
    setShowDeleteDialog,
    setValue,
    showDeleteDialog,
    transactionType,
  };
}
