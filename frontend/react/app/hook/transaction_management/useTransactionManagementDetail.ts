import { zodResolver } from "@hookform/resolvers/zod";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Keyboard } from "react-native";
import type {
  AccountFieldName,
  AccountPickerItemType,
} from "../../app/transaction_management/_components/AccountIdField";
import type { AppIconProps } from "../../components/AppIcon";
import type { AppListCardItemType } from "../../components/AppListCardView";
import type { SelectOptionType } from "../../components/AppSelect";
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
import { getSelectableAccMgmtList } from "../../sql/service/accMgmtService";
import { getCategoryMgmtList } from "../../sql/service/categoryMgmtService";
import {
  deleteTransactionMgmt,
  getExchangeRateSuggestion,
  getTransactionOperationById,
  updateTransactionMgmt,
} from "../../sql/service/transactionMgmtService";
import { DEBUG_TAG } from "../../utils/debugLog";
import { getZeroAmount, toAmountString } from "../../utils/amount";
import {
  calculateConvertedAmount,
  calculateExchangeRate,
  EXCHANGE_RATE_ZERO,
  formatExchangeRate,
} from "../../utils/exchangeRate";
import { useTranslation } from "../../i18n/helper";
import {
  getCategoryDisplayDescription,
  getCategoryDisplayLabel,
} from "../category_management/categoryManagementList.utils";
import useCurrencyPreferenceOptions from "../currency_management/useCurrencyPreferenceOptions";

const TRANSACTION_CATEGORY_PAGE_SIZE = 1000;

export default function useTransactionManagementDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isAccountPickerVisible, setIsAccountPickerVisible] = useState(false);
  const [activeAccountField, setActiveAccountField] =
    useState<AccountFieldName>("accountId");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRateSuggestion, setIsLoadingRateSuggestion] = useState(false);
  const [rateSuggestionLabel, setRateSuggestionLabel] = useState("");
  const [responseError, setResponseError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const reopenAccountPickerOnFocus = useRef(false);
  const refreshCategoriesOnFocus = useRef(false);
  const isSubmitting = isDeleting || isSaving;
  const currencyPreferences = useCurrencyPreferenceOptions();

  const {
    data: operation,
    error: transactionError,
    isLoading: isLoadingTransaction,
  } = useQuery({
    queryKey: transactionManagementQueryKeys.detail(id),
    queryFn: () => getTransactionOperationById(id),
    enabled: Boolean(id),
  });
  const transaction = operation?.main;

  const {
    clearErrors,
    control,
    formState: { isSubmitted },
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

  const {
    fields: feeFields,
    append: appendFeeField,
    remove: removeFee,
  } = useFieldArray({ control, name: "fees" });

  const transactionType = watch("transactionType");
  const accountId = watch("accountId");
  const fromAccountId = watch("fromAccountId");
  const toAccountId = watch("toAccountId");
  const amount = watch("amount");
  const currencyCode = watch("currencyCode");
  const accountCurrencyCode = watch("accountCurrencyCode");
  const exchangeRate = watch("exchangeRate");
  const transactionDate = watch("transactionDate");
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
      pageSize: TRANSACTION_CATEGORY_PAGE_SIZE,
    }),
    queryFn: ({ pageParam }) =>
      getCategoryMgmtList(
        categoryTypeId!,
        pageParam,
        TRANSACTION_CATEGORY_PAGE_SIZE,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === TRANSACTION_CATEGORY_PAGE_SIZE
        ? allPages.length + 1
        : undefined,
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
    queryKey: accountManagementQueryKeys.selectableList({
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    queryFn: ({ pageParam }) =>
      getSelectableAccMgmtList(pageParam, DEFAULT_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === DEFAULT_PAGE_SIZE ? allPages.length + 1 : undefined,
  });

  const { data: feeCategories = [] } = useQuery({
    queryKey: categoryManagementQueryKeys.feeList(),
    queryFn: () => getCategoryMgmtList(2, 1, 1000),
  });

  const categoryItems = useMemo<AppListCardItemType[]>(() => {
    const items =
      categories?.pages.reduce<AppListCardItemType[]>((result, page) => {
        page.forEach((category) =>
          result.push({
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
          }),
        );
        return result;
      }, []) ?? [];
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

  const accountItems = useMemo<AccountPickerItemType[]>(() => {
    const items: AccountPickerItemType[] =
      accounts?.pages.reduce<AccountPickerItemType[]>((result, page) => {
        page.forEach((account) =>
          result.push({
            id: account.id,
            icon: account.type_icon as AppIconProps["name"],
            label: account.label,
            balance: account.current_balance,
            currencyCode: account.currency_code,
            inputLabel: `${account.currency_code} - ${account.label}`,
            descriptions: account.descriptions ?? undefined,
            typeId: account.type_id,
            typeLabel: account.type_label,
            typeIcon: account.type_icon as AppIconProps["name"],
          }),
        );
        return result;
      }, []) ?? [];
    const savedAccounts = [
      {
        id: transaction?.account_id,
        label: transaction?.account_label,
        currencyCode: transaction?.account_currency_code,
      },
      {
        id: transaction?.from_account_id,
        label: transaction?.from_account_label,
        currencyCode: transaction?.currency_code,
      },
      {
        id: transaction?.to_account_id,
        label: transaction?.to_account_label,
        currencyCode: transaction?.account_currency_code,
      },
    ];
    for (const saved of savedAccounts) {
      if (!saved.id || items.some((item) => item.id === saved.id)) continue;
      items.push({
        id: saved.id,
        icon: "WalletCards",
        label: saved.label ?? t("Selected Account"),
        inputLabel: saved.label ?? t("Selected Account"),
        descriptions: t("Currency disabled"),
        balance: 0,
        currencyCode: saved.currencyCode,
        typeId: "unavailable",
        typeLabel: t("Unavailable"),
        typeIcon: "WalletCards",
        disabled: true,
      });
    }
    return items;
  }, [accounts, t, transaction]);

  const feeCategoryOptions = useMemo<SelectOptionType[]>(() => {
    const options = feeCategories.map((category) => ({
      id: category.id,
      icon: category.icon as AppIconProps["name"],
      label: getCategoryDisplayLabel(
        category.label,
        category.translation_key,
        t,
      ),
      value: category.id,
    }));
    operation?.fees.forEach((fee) => {
      if (!fee.category_id || options.some(({ id }) => id === fee.category_id))
        return;
      options.push({
        id: fee.category_id,
        icon: (fee.category_icon ?? "Tag") as AppIconProps["name"],
        label: getCategoryDisplayLabel(
          fee.category_label ?? t("Selected Category"),
          fee.category_translation_key,
          t,
        ),
        value: fee.category_id,
      });
    });
    return options;
  }, [feeCategories, operation?.fees, t]);
  const defaultFeeCategoryId =
    feeCategories.find((category) => category.label === "Fees & Charges")?.id ??
    "";
  const selectedFromAccount = accountItems.find(
    (item) => item.id === fromAccountId,
  );
  const selectedToAccount = accountItems.find(
    (item) => item.id === toAccountId,
  );
  const usesExchangeRate =
    Boolean(currencyCode && accountCurrencyCode) &&
    currencyCode !== accountCurrencyCode;

  const clearExchangeRate = () => {
    setValue("exchangeRate", EXCHANGE_RATE_ZERO, { shouldValidate: false });
    setValue("exchangeRateSource", undefined);
    setValue("exchangeRateSourceTransactionId", "");
    setRateSuggestionLabel("");
    clearErrors(["exchangeRate", "convertedAmount"]);
  };

  const resetConversionForCurrencies = (
    sourceCurrencyCode: string,
    destinationCurrencyCode: string,
  ) => {
    setValue("currencyCode", sourceCurrencyCode, { shouldValidate: true });
    setValue("accountCurrencyCode", destinationCurrencyCode, {
      shouldValidate: true,
    });
    clearExchangeRate();
    setValue(
      "convertedAmount",
      sourceCurrencyCode === destinationCurrencyCode
        ? amount
        : getZeroAmount(destinationCurrencyCode),
      { shouldValidate: false },
    );
  };

  const onAccountChange = (
    fieldName: AccountFieldName,
    account?: AccountPickerItemType,
  ) => {
    if (!account?.currencyCode) {
      resetConversionForCurrencies(
        fieldName === "toAccountId"
          ? (selectedFromAccount?.currencyCode ?? "")
          : "",
        fieldName === "fromAccountId"
          ? (selectedToAccount?.currencyCode ?? "")
          : "",
      );
      return;
    }
    if (fieldName === "accountId") {
      resetConversionForCurrencies(account.currencyCode, account.currencyCode);
      return;
    }
    const fromCurrency =
      fieldName === "fromAccountId"
        ? account.currencyCode
        : (selectedFromAccount?.currencyCode ?? "");
    const toCurrency =
      fieldName === "toAccountId"
        ? account.currencyCode
        : (selectedToAccount?.currencyCode ?? "");
    resetConversionForCurrencies(fromCurrency, toCurrency);
  };

  const onCurrencyChange = (nextCurrencyCode: string) => {
    const nextAmount = toAmountString(amount, nextCurrencyCode);
    setValue("amount", nextAmount, { shouldValidate: true });
    setValue("currencyCode", nextCurrencyCode, { shouldValidate: true });
    clearExchangeRate();
    setValue(
      "convertedAmount",
      nextCurrencyCode === accountCurrencyCode
        ? nextAmount
        : getZeroAmount(accountCurrencyCode),
      { shouldValidate: false },
    );
  };

  const onAmountChange = (nextAmount: string) => {
    setValue("amount", nextAmount, { shouldValidate: true });
    if (currencyCode === accountCurrencyCode) {
      setValue("convertedAmount", nextAmount, { shouldValidate: true });
    } else if (Number(exchangeRate) > 0) {
      setValue(
        "convertedAmount",
        calculateConvertedAmount(nextAmount, exchangeRate, accountCurrencyCode),
        { shouldValidate: true },
      );
    }
  };

  const onExchangeRateChange = (nextRate: string) => {
    setValue("exchangeRate", nextRate, { shouldValidate: true });
    const hasRate = Number(nextRate) > 0;
    setValue("exchangeRateSource", hasRate ? "manual" : undefined);
    setValue("exchangeRateSourceTransactionId", "");
    setRateSuggestionLabel(hasRate ? t("Manual rate") : "");
    if (hasRate) {
      setValue(
        "convertedAmount",
        calculateConvertedAmount(amount, nextRate, accountCurrencyCode),
        {
          shouldValidate: true,
        },
      );
    }
  };

  const onExchangeRateBlur = () => {
    if (!exchangeRate) return;
    onExchangeRateChange(formatExchangeRate(exchangeRate));
  };

  const onConvertedAmountChange = (nextAmount: string) => {
    setValue("convertedAmount", nextAmount, { shouldValidate: true });
    const nextRate = calculateExchangeRate(amount, nextAmount);
    setValue("exchangeRate", nextRate || EXCHANGE_RATE_ZERO, {
      shouldValidate: true,
    });
    setValue("exchangeRateSource", nextRate ? "manual" : undefined);
    setValue("exchangeRateSourceTransactionId", "");
    setRateSuggestionLabel(nextRate ? t("Manual rate") : "");
  };

  const onUsePreviousRate = async () => {
    if (!currencyCode || !accountCurrencyCode || !transactionDate) return;
    try {
      setIsLoadingRateSuggestion(true);
      const suggestion = await getExchangeRateSuggestion(
        currencyCode,
        accountCurrencyCode,
        transactionDate,
        transaction?.id,
      );
      if (!suggestion) {
        AppToast.info({ message: "No previous exchange rate found." });
        return;
      }
      const nextRate = formatExchangeRate(suggestion.rate);
      setValue("exchangeRate", nextRate, { shouldValidate: true });
      setValue("exchangeRateSource", suggestion.source);
      setValue(
        "exchangeRateSourceTransactionId",
        suggestion.sourceTransactionId,
      );
      setValue(
        "convertedAmount",
        calculateConvertedAmount(amount, nextRate, accountCurrencyCode),
        {
          shouldValidate: true,
        },
      );
      setRateSuggestionLabel(
        `${t(suggestion.source === "inverse" ? "Suggested from reverse rate" : "Previous rate")} · ${suggestion.transactionDate}`,
      );
    } finally {
      setIsLoadingRateSuggestion(false);
    }
  };

  const addFee = () => {
    appendFeeField({
      accountId:
        transactionType === TXN_TYPE_ENUM.TRANSFER ? fromAccountId : accountId,
      amount: getZeroAmount(
        transactionType === TXN_TYPE_ENUM.TRANSFER
          ? currencyCode
          : accountCurrencyCode,
      ),
      categoryId: defaultFeeCategoryId,
    });
  };
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
      amount: toAmountString(transaction.amount, transaction.currency_code),
      currencyCode: transaction.currency_code,
      accountCurrencyCode: transaction.account_currency_code,
      convertedAmount: toAmountString(
        transaction.converted_amount,
        transaction.account_currency_code,
      ),
      exchangeRate: transaction.exchange_rate
        ? formatExchangeRate(transaction.exchange_rate)
        : EXCHANGE_RATE_ZERO,
      exchangeRateSource: transaction.exchange_rate_source ?? undefined,
      exchangeRateSourceTransactionId:
        transaction.exchange_rate_source_transaction_id ?? "",
      fees:
        operation?.fees.map((fee) => ({
          accountId: fee.account_id ?? "",
          amount: toAmountString(
            fee.converted_amount,
            fee.account_currency_code,
          ),
          categoryId: fee.category_id ?? "",
        })) ?? [],
      description: transaction.descriptions ?? "",
      transactionDate: transaction.transaction_date,
    });
    setRateSuggestionLabel(
      transaction.exchange_rate_source === "inverse"
        ? t("Suggested from reverse rate")
        : transaction.exchange_rate_source === "previous"
          ? t("Previous rate")
          : transaction.exchange_rate_source === "manual"
            ? t("Manual rate")
            : "",
    );
  }, [operation?.fees, reset, t, transaction]);

  useEffect(() => {
    if (!transactionError) return;
    console.error(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Error when getting transaction detail",
      transactionError,
    );
  }, [transactionError]);

  useEffect(() => {
    if (isLoadingTransaction || operation !== null) return;
    AppToast.error({ message: "Transaction not found." });
    router.back();
  }, [isLoadingTransaction, operation]);

  const onSubmit = async (value: TransactionManagementFormType) => {
    try {
      Keyboard.dismiss();
      setResponseError("");
      setIsSaving(true);
      const errorMessage = await updateTransactionMgmt({
        ...value,
        id,
        description: value.description?.trim(),
        fees: value.fees.map((fee) => ({
          ...fee,
          accountId:
            value.transactionType === TXN_TYPE_ENUM.TRANSFER
              ? value.fromAccountId
              : value.accountId,
        })),
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
    accountCurrencyCode,
    accountFieldProps,
    addFee,
    activeAccountField,
    amount,
    categoryError,
    categoryItems,
    clearErrors,
    control,
    currencyCode,
    currencyOptions: currencyPreferences.currencyOptions.map((currency) => ({
      ...currency,
      label: currency.id.toString(),
    })),
    exchangeRate,
    feeCategoryOptions,
    feeFields,
    handleSubmit,
    isAccountPickerVisible,
    isDeleting,
    isFetchingNextCategoryPage,
    isLoadingCategories,
    isLoadingRateSuggestion,
    isLoadingTransaction,
    isSaving,
    isSubmitted,
    isSubmitting,
    onDelete,
    onAccountChange,
    onAmountChange,
    onConvertedAmountChange,
    onCurrencyChange,
    onExchangeRateChange,
    onExchangeRateBlur,
    onLoadMoreCategories,
    onManageCategories,
    onSubmit,
    onUsePreviousRate,
    openAccountPicker,
    responseError,
    rateSuggestionLabel,
    removeFee,
    setFocus,
    setShowDeleteDialog,
    setValue,
    showCurrencyField: currencyPreferences.showCurrencyField,
    showDeleteDialog,
    transactionType,
    usesExchangeRate,
  };
}
