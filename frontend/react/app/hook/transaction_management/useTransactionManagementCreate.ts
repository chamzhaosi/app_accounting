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
import {
  getCategoryMgmtById,
  getCategoryMgmtList,
} from "../../sql/service/categoryMgmtService";
import { createNewTransactionMgmt } from "../../sql/service/transactionMgmtService";
import { DEBUG_TAG } from "../../utils/debugLog";

export default function useTransactionManagementCreate() {
  const {
    accountId: initialAccountId,
    categoryId: initialCategoryId,
    transactionType: initialTransactionType,
  } = useLocalSearchParams<{
    accountId?: string;
    categoryId?: string;
    transactionType?: TXN_TYPE_ENUM;
  }>();
  const queryClient = useQueryClient();
  const [isAccountPickerVisible, setIsAccountPickerVisible] = useState(false);
  const [activeAccountField, setActiveAccountField] =
    useState<AccountFieldName>("accountId");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAndNew, setIsSavingAndNew] = useState(false);
  const [responseError, setResponseError] = useState("");
  const reopenAccountPickerOnFocus = useRef(false);
  const refreshCategoriesOnFocus = useRef(false);
  const isSubmitting = isSaving || isSavingAndNew;
  const today = dayjs().format("YYYY-MM-DD");

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
    defaultValues: {
      ...getTransactionManagementFormDefaultValues(today),
      accountId: initialAccountId ?? "",
      categoryId: initialCategoryId ?? "",
      transactionType: initialTransactionType ?? TXN_TYPE_ENUM.EXPENSE,
    },
  });

  const transactionType = watch("transactionType");
  const categoryId = watch("categoryId");
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

  const { data: initialCategory, isLoading: isLoadingInitialCategory } =
    useQuery({
      queryKey: categoryManagementQueryKeys.detail(initialCategoryId ?? ""),
      queryFn: () => getCategoryMgmtById(initialCategoryId!),
      enabled: Boolean(initialCategoryId),
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
        label: category.label,
        description: category.descriptions ?? undefined,
      })) ?? [];

    if (
      !initialCategory ||
      initialCategory.type_id !== categoryTypeId ||
      items.some((category) => category.id === initialCategory.id)
    ) {
      return items;
    }

    return [
      {
        id: initialCategory.id,
        icon: initialCategory.icon as AppIconProps["name"],
        label: initialCategory.label,
        description: initialCategory.descriptions ?? undefined,
      },
      ...items,
    ];
  }, [categories, categoryTypeId, initialCategory]);

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

  const onSubmit = async (
    value: TransactionManagementFormType,
    saveAnotherTransaction: boolean,
  ) => {
    Keyboard.dismiss();
    const setLoading = saveAnotherTransaction ? setIsSavingAndNew : setIsSaving;

    try {
      setResponseError("");
      setLoading(true);
      const errorMessage = await createNewTransactionMgmt({
        ...value,
        description: value.description?.trim(),
      });

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
      AppToast.success({ message: "Transaction created successfully" });
      reset({
        ...getTransactionManagementFormDefaultValues(today),
        accountId: initialAccountId ?? "",
        categoryId: initialCategoryId ?? "",
        transactionType: initialTransactionType ?? TXN_TYPE_ENUM.EXPENSE,
      });

      if (!saveAnotherTransaction) router.back();
    } catch (e) {
      console.error(
        DEBUG_TAG.TRANSACTION_MANAGEMENT,
        "Error when creating transaction",
        e,
      );
      AppToast.error({ message: "Unable to save transaction." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      isLoadingCategories ||
      (initialCategoryId && isLoadingInitialCategory) ||
      categoryError ||
      transactionType === TXN_TYPE_ENUM.TRANSFER
    )
      return;

    if (!categoryItems.length) {
      if (categoryId) setValue("categoryId", "", { shouldValidate: true });
      return;
    }

    const isSelectedCategoryAvailable = categoryItems.some(
      (category) => category.id.toString() === categoryId,
    );
    if (isSelectedCategoryAvailable) return;

    setValue("categoryId", categoryItems[0].id.toString());
  }, [
    categoryError,
    categoryId,
    categoryItems,
    isLoadingCategories,
    initialCategoryId,
    isLoadingInitialCategory,
    setValue,
    transactionType,
  ]);

  return {
    accountFieldProps,
    activeAccountField,
    categoryError,
    categoryItems,
    clearErrors,
    control,
    handleSubmit,
    isAccountPickerVisible,
    isFetchingNextCategoryPage,
    isLoadingCategories,
    isSaving,
    isSavingAndNew,
    isSubmitting,
    onLoadMoreCategories,
    onManageCategories,
    onSubmit,
    openAccountPicker,
    responseError,
    setFocus,
    setValue,
    transactionType,
  };
}
