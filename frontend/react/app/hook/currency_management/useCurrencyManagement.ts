import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AppToast } from "../../components/AppToast";
import { CURRENCIES, DEFAULT_CURRENCY_CODE } from "../../constants/currencies";
import {
  currencyManagementQueryKeys,
  invalidateQuery,
} from "../../constants/queryKeys";
import {
  getCurrencyPreferences,
  saveCurrencyPreferences,
} from "../../sql/service/currencyManagementService";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();

const SEARCH_DEBOUNCE_MS = 250;

export default function useCurrencyManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [defaultCurrencyCode, setDefaultCurrencyCode] = useState(
    DEFAULT_CURRENCY_CODE,
  );
  const [enabledCurrencyCodes, setEnabledCurrencyCodes] = useState<string[]>([
    DEFAULT_CURRENCY_CODE,
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const { data, error, isFetched, isLoading } = useQuery({
    queryKey: currencyManagementQueryKeys.preferences(),
    queryFn: getCurrencyPreferences,
  });

  useEffect(() => {
    if (!isFetched) return;
    setDefaultCurrencyCode(data?.defaultCurrencyCode ?? DEFAULT_CURRENCY_CODE);
    setEnabledCurrencyCodes(
      data?.enabledCurrencyCodes ?? [DEFAULT_CURRENCY_CODE],
    );
  }, [data, isFetched]);

  useEffect(() => {
    if (!error) return;
    console.error(
      DEBUG_TAG.CURRENCY_MANAGEMENT,
      "Error when loading currency preferences",
      error,
    );
    AppToast.error({ message: "Unable to load currency preferences." });
  }, [error]);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [search]);

  const filteredCurrencies = useMemo(() => {
    const query = normalizeSearchText(debouncedSearch);
    const matches = query
      ? CURRENCIES.filter((currency) =>
          normalizeSearchText(
            [
              currency.code,
              currency.name,
              currency.symbol,
              ...currency.countries,
            ].join(" "),
          ).includes(query),
        )
      : CURRENCIES;

    const rank = (code: string) => {
      if (code === defaultCurrencyCode) return 0;
      if (enabledCurrencyCodes.includes(code)) return 1;
      return 2;
    };

    return [...matches].sort(
      (left, right) =>
        rank(left.code) - rank(right.code) ||
        left.code.localeCompare(right.code),
    );
  }, [debouncedSearch, defaultCurrencyCode, enabledCurrencyCodes]);

  const enabledCurrencies = useMemo(
    () =>
      CURRENCIES.filter(({ code }) => enabledCurrencyCodes.includes(code)).sort(
        (left, right) =>
          Number(right.code === defaultCurrencyCode) -
            Number(left.code === defaultCurrencyCode) ||
          left.code.localeCompare(right.code),
      ),
    [defaultCurrencyCode, enabledCurrencyCodes],
  );

  const openPicker = () => {
    setSearch("");
    setIsPickerVisible(true);
  };

  const dismissPicker = () => setIsPickerVisible(false);

  const toggleCurrency = (code: string) => {
    if (code === defaultCurrencyCode) return;
    setEnabledCurrencyCodes((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  };

  const selectDefaultCurrency = (code: string) => {
    setDefaultCurrencyCode(code);
    setEnabledCurrencyCodes((current) =>
      current.includes(code) ? current : [...current, code],
    );
  };

  const onSave = async () => {
    try {
      setIsSaving(true);
      const validationMessage = await saveCurrencyPreferences({
        defaultCurrencyCode,
        enabledCurrencyCodes,
      });

      if (validationMessage) {
        AppToast.warning({ message: validationMessage });
        return false;
      }

      await invalidateQuery(
        queryClient,
        currencyManagementQueryKeys.preferences(),
      );
      debugLog(DEBUG_TAG.CURRENCY_MANAGEMENT, "Currency preferences saved", {
        count: enabledCurrencyCodes.length,
        defaultCurrencyCode,
      });
      AppToast.success({ message: "Currency preferences saved successfully" });
      return true;
    } catch (saveError) {
      console.error(
        DEBUG_TAG.CURRENCY_MANAGEMENT,
        "Error when saving currency preferences",
        saveError,
      );
      AppToast.error({ message: "Unable to save currency preferences." });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    defaultCurrencyCode,
    dismissPicker,
    enabledCurrencies,
    enabledCurrencyCodes,
    filteredCurrencies,
    isLoading,
    isPickerVisible,
    isSaving,
    onSave,
    openPicker,
    search,
    selectDefaultCurrency,
    setSearch,
    toggleCurrency,
  };
}
