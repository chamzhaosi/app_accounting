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
import {
  getCategoryMgmtById,
  getCategoryMgmtList,
} from "../../sql/service/categoryMgmtService";
import {
  createNewTransactionMgmt,
  getExchangeRateSuggestion,
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

export default function useTransactionManagementCreate() {
  const { t } = useTranslation();
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
  const [isLoadingRateSuggestion, setIsLoadingRateSuggestion] = useState(false);
  const [rateSuggestionLabel, setRateSuggestionLabel] = useState("");
  const [responseError, setResponseError] = useState("");
  const reopenAccountPickerOnFocus = useRef(false);
  const refreshCategoriesOnFocus = useRef(false);
  const isSubmitting = isSaving || isSavingAndNew;
  const today = dayjs().format("YYYY-MM-DD");
  const currencyPreferences = useCurrencyPreferenceOptions();

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
    defaultValues: {
      ...getTransactionManagementFormDefaultValues(today),
      accountId: initialAccountId ?? "",
      categoryId: initialCategoryId ?? "",
      transactionType: initialTransactionType ?? TXN_TYPE_ENUM.EXPENSE,
    },
  });

  const {
    fields: feeFields,
    append: appendFeeField,
    remove: removeFee,
  } = useFieldArray({ control, name: "fees" });

  const transactionType = watch("transactionType");
  const categoryId = watch("categoryId");
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
        label: getCategoryDisplayLabel(
          initialCategory.label,
          initialCategory.translation_key,
          t,
        ),
        description: getCategoryDisplayDescription(
          initialCategory.descriptions,
          initialCategory.translation_key,
          t,
        ),
      },
      ...items,
    ];
  }, [categories, categoryTypeId, initialCategory, t]);

  const accountItems = useMemo<AccountPickerItemType[]>(
    () =>
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
      }, []) ?? [],
    [accounts],
  );

  const feeCategoryOptions = useMemo<SelectOptionType[]>(
    () =>
      feeCategories.map((category) => ({
        id: category.id,
        icon: category.icon as AppIconProps["name"],
        label: getCategoryDisplayLabel(
          category.label,
          category.translation_key,
          t,
        ),
        value: category.id,
      })),
    [feeCategories, t],
  );
  const defaultFeeCategoryId =
    feeCategories.find((category) => category.label === "Fees & Charges")?.id ??
    "";

  const selectedAccount = accountItems.find((item) => item.id === accountId);
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
      return;
    }
    if (Number(exchangeRate) > 0) {
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
    } catch (error) {
      console.error(
        DEBUG_TAG.TRANSACTION_MANAGEMENT,
        "Unable to load previous exchange rate",
        error,
      );
      AppToast.error({ message: "Unable to load previous exchange rate." });
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
    if (
      transactionType !== TXN_TYPE_ENUM.TRANSFER &&
      selectedAccount?.currencyCode &&
      !accountCurrencyCode
    ) {
      resetConversionForCurrencies(
        selectedAccount.currencyCode,
        selectedAccount.currencyCode,
      );
    }
  }, [accountCurrencyCode, selectedAccount?.currencyCode, transactionType]);

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
    isFetchingNextCategoryPage,
    isLoadingCategories,
    isLoadingRateSuggestion,
    isSaving,
    isSavingAndNew,
    isSubmitted,
    isSubmitting,
    onLoadMoreCategories,
    onManageCategories,
    onAccountChange,
    onAmountChange,
    onConvertedAmountChange,
    onCurrencyChange,
    onExchangeRateChange,
    onExchangeRateBlur,
    onSubmit,
    onUsePreviousRate,
    openAccountPicker,
    responseError,
    rateSuggestionLabel,
    removeFee,
    setFocus,
    setValue,
    showCurrencyField: currencyPreferences.showCurrencyField,
    transactionType,
    usesExchangeRate,
  };
}
