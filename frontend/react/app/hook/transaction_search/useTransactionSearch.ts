import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SelectOptionType } from "../../components/AppSelect";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import { transactionSearchQueryKeys } from "../../constants/queryKeys";
import { DEFAULT_PAGE_SIZE } from "../../constants/size";
import {
  clearTransactionSearchHistory,
  getTransactionSearchHistory,
  removeTransactionSearchKeyword,
  saveTransactionSearchKeyword,
} from "../../local/transactionSearchHistory";
import {
  getTransactionSearchFilterOptions,
  searchTransactions,
} from "../../sql/service/transactionSearchService";
import type { TransactionSearchFilters } from "../../sql/types/transactionSearchType";
import { useTranslation } from "../../i18n/helper";
import { compareAmounts, isAmountWithinRange } from "../../utils/amount";
import { DEBUG_TAG } from "../../utils/debugLog";
import { getCategoryDisplayLabel } from "../category_management/categoryManagementList.utils";
import useSingleCurrencyMode from "../currency_management/useSingleCurrencyMode";
import { getTransactionAccountDisplayLabel } from "../transaction_management/transactionAccount.utils";
import { mapTransactionListItem } from "../transaction_management/transactionList.utils";

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_HISTORY_IDLE_MS = 700;
const AMOUNT_FILTER_PATTERN = /^\d{1,13}(?:\.\d{1,3})?$/;

const hasFilters = (filters: TransactionSearchFilters) =>
  Object.values(filters).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );

const normalizeFilters = (
  filters: TransactionSearchFilters,
): TransactionSearchFilters => ({
  ...filters,
  accountIds: filters.accountIds?.length ? filters.accountIds : undefined,
  categoryIds: filters.categoryIds?.length ? filters.categoryIds : undefined,
  transactionTypes: filters.transactionTypes?.length
    ? filters.transactionTypes
    : undefined,
  currencyCodes: filters.currencyCodes?.length
    ? filters.currencyCodes
    : undefined,
  minimumAmount: filters.minimumAmount?.trim() || undefined,
  maximumAmount: filters.maximumAmount?.trim() || undefined,
});

const validateFilters = (filters: TransactionSearchFilters) => {
  if (
    filters.startDate &&
    filters.endDate &&
    filters.startDate > filters.endDate
  )
    return "Start date must not be after end date.";

  for (const value of [filters.minimumAmount, filters.maximumAmount]) {
    if (
      value !== undefined &&
      (!AMOUNT_FILTER_PATTERN.test(value) || !isAmountWithinRange(value))
    )
      return "Enter a valid amount.";
  }

  if (
    filters.minimumAmount !== undefined &&
    filters.maximumAmount !== undefined &&
    compareAmounts(filters.minimumAmount, filters.maximumAmount) > 0
  )
    return "Minimum amount must not exceed maximum amount.";

  return undefined;
};

export default function useTransactionSearch() {
  const { t } = useTranslation();
  const isSingleCurrency = useSingleCurrencyMode();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [filters, setFilters] = useState<TransactionSearchFilters>({});
  const [filterError, setFilterError] = useState<string>();
  const [history, setHistory] = useState<string[]>([]);
  const historyRef = useRef<string[]>([]);
  const lastAutoSavedKeywordRef = useRef("");

  useEffect(() => {
    void getTransactionSearchHistory().then((storedHistory) => {
      historyRef.current = storedHistory;
      setHistory(storedHistory);
    });
  }, []);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setDebouncedKeyword(keyword.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timeoutId);
  }, [keyword]);

  const isSearchActive = Boolean(debouncedKeyword) || hasFilters(filters);
  const searchQuery = useInfiniteQuery({
    queryKey: transactionSearchQueryKeys.result({
      keyword: debouncedKeyword.toLocaleLowerCase(),
      filters,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    queryFn: ({ pageParam }) =>
      searchTransactions({
        keyword: debouncedKeyword,
        filters,
        curPage: pageParam,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    enabled: isSearchActive,
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === DEFAULT_PAGE_SIZE ? pages.length + 1 : undefined,
  });

  const filterOptionsQuery = useQuery({
    queryKey: transactionSearchQueryKeys.filterOptions(),
    queryFn: getTransactionSearchFilterOptions,
  });

  useEffect(() => {
    const normalizedKeyword = keyword.trim();
    if (!normalizedKeyword) {
      lastAutoSavedKeywordRef.current = "";
      return;
    }
    if (
      normalizedKeyword !== debouncedKeyword ||
      !searchQuery.isSuccess ||
      searchQuery.isFetching
    )
      return;

    const timeoutId = setTimeout(() => {
      const previousKeyword = lastAutoSavedKeywordRef.current;
      const normalizedCurrent = normalizedKeyword.toLocaleLowerCase();
      const normalizedPrevious = previousKeyword.toLocaleLowerCase();
      const isTypingCombination =
        Boolean(normalizedPrevious) &&
        (normalizedCurrent.startsWith(normalizedPrevious) ||
          normalizedPrevious.startsWith(normalizedCurrent));
      const currentHistory = isTypingCombination
        ? historyRef.current.filter(
            (item) => item.trim().toLocaleLowerCase() !== normalizedPrevious,
          )
        : historyRef.current;

      lastAutoSavedKeywordRef.current = normalizedKeyword;
      void saveTransactionSearchKeyword(normalizedKeyword, currentHistory).then(
        (nextHistory) => {
          historyRef.current = nextHistory;
          setHistory(nextHistory);
        },
      );
    }, SEARCH_HISTORY_IDLE_MS);

    return () => clearTimeout(timeoutId);
  }, [
    debouncedKeyword,
    keyword,
    searchQuery.isFetching,
    searchQuery.isSuccess,
  ]);

  useEffect(() => {
    if (searchQuery.error)
      console.error(
        DEBUG_TAG.TRANSACTION_SEARCH,
        "Error when searching transactions",
        searchQuery.error,
      );
  }, [searchQuery.error]);

  useEffect(() => {
    if (filterOptionsQuery.error)
      console.error(
        DEBUG_TAG.TRANSACTION_SEARCH,
        "Error when loading search filters",
        filterOptionsQuery.error,
      );
  }, [filterOptionsQuery.error]);

  const results = useMemo(
    () =>
      (searchQuery.data?.pages.flat() ?? []).map((transaction) =>
        mapTransactionListItem(transaction, { isSingleCurrency, t }),
      ),
    [isSingleCurrency, searchQuery.data, t],
  );

  const accountPickerItems = useMemo(
    () =>
      (filterOptionsQuery.data?.accounts ?? []).map((account) => ({
        id: account.id,
        icon: account.icon as NonNullable<SelectOptionType["icon"]>,
        label: account.label,
        descriptions: account.description ?? undefined,
        balance: account.currentBalance,
        currencyCode: account.currencyCode,
        inputLabel: getTransactionAccountDisplayLabel(
          account.label,
          account.currencyCode,
          isSingleCurrency,
        ),
        typeId: account.typeId,
        typeLabel: account.typeLabel,
        typeIcon: account.icon as NonNullable<SelectOptionType["icon"]>,
      })),
    [filterOptionsQuery.data?.accounts, isSingleCurrency],
  );
  const categoryOptions = useMemo<SelectOptionType[]>(
    () =>
      (filterOptionsQuery.data?.categories ?? []).map((category) => ({
        id: category.id,
        icon: category.icon as SelectOptionType["icon"],
        groupLabel: category.typeId === 1 ? "Income" : "Expense",
        value: category.id,
        label: getCategoryDisplayLabel(
          category.label,
          category.translationKey,
          t,
        ),
      })),
    [filterOptionsQuery.data?.categories, t],
  );
  const currencyOptions = useMemo<SelectOptionType[]>(
    () =>
      (filterOptionsQuery.data?.currencyCodes ?? []).map((code) => ({
        id: code,
        value: code,
        label: code,
      })),
    [filterOptionsQuery.data?.currencyCodes],
  );
  const transactionTypeOptions = useMemo<SelectOptionType[]>(
    () => [
      {
        id: TXN_TYPE_ENUM.INCOME,
        value: TXN_TYPE_ENUM.INCOME,
        label: t("Income"),
      },
      {
        id: TXN_TYPE_ENUM.EXPENSE,
        value: TXN_TYPE_ENUM.EXPENSE,
        label: t("Expense"),
      },
      {
        id: TXN_TYPE_ENUM.TRANSFER,
        value: TXN_TYPE_ENUM.TRANSFER,
        label: t("Transfer"),
      },
      {
        id: TXN_TYPE_ENUM.ADJUSTMENT,
        value: TXN_TYPE_ENUM.ADJUSTMENT,
        label: t("Balance Adjustment"),
      },
    ],
    [t],
  );

  const activeFilterCount = [
    Boolean(filters.startDate || filters.endDate),
    Boolean(filters.accountIds?.length),
    Boolean(filters.categoryIds?.length),
    Boolean(filters.transactionTypes?.length),
    Boolean(filters.currencyCodes?.length),
    Boolean(filters.minimumAmount || filters.maximumAmount),
  ].filter(Boolean).length;

  const submitSearch = () => {
    const normalizedKeyword = keyword.trim();
    setDebouncedKeyword(normalizedKeyword);
  };
  const applyFilters = (nextFilters: TransactionSearchFilters) => {
    const normalizedFilters = normalizeFilters(nextFilters);
    const validationError = validateFilters(normalizedFilters);
    setFilterError(validationError);
    if (validationError) return false;

    setFilters(normalizedFilters);
    setDebouncedKeyword(keyword.trim());
    return true;
  };
  const resetFilters = () => {
    setFilterError(undefined);
    setFilters({});
    setDebouncedKeyword(keyword.trim());
  };
  const selectHistory = (value: string) => {
    setKeyword(value);
    setDebouncedKeyword(value);
    lastAutoSavedKeywordRef.current = value;
    void saveTransactionSearchKeyword(value, historyRef.current).then(
      (nextHistory) => {
        historyRef.current = nextHistory;
        setHistory(nextHistory);
      },
    );
  };
  const removeHistory = (value: string) =>
    void removeTransactionSearchKeyword(value, historyRef.current).then(
      (nextHistory) => {
        historyRef.current = nextHistory;
        setHistory(nextHistory);
      },
    );
  const clearHistory = () => {
    historyRef.current = [];
    setHistory([]);
    void clearTransactionSearchHistory();
  };
  const onLoadMore = () => {
    if (!searchQuery.hasNextPage || searchQuery.isFetchingNextPage) return;
    void searchQuery.fetchNextPage();
  };

  return {
    accountPickerItems,
    activeFilterCount,
    applyFilters,
    categoryOptions,
    clearHistory,
    currencyOptions,
    filterError,
    filters,
    history,
    isFetchingNextPage: searchQuery.isFetchingNextPage,
    isLoading: searchQuery.isLoading,
    isSearchActive,
    keyword,
    onLoadMore,
    removeHistory,
    resetFilters,
    results,
    selectHistory,
    setFilterError,
    setKeyword,
    submitSearch,
    transactionTypeOptions,
  };
}
