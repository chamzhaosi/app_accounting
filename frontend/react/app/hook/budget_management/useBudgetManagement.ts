import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Keyboard } from "react-native";
import type { SelectOptionType } from "../../components/AppSelect";
import { AppToast } from "../../components/AppToast";
import { CURRENCIES } from "../../constants/currencies";
import {
  budgetQueryKeys,
  currencyManagementQueryKeys,
  invalidateQuery,
} from "../../constants/queryKeys";
import { BUDGET_MANAGEMENT_LIST_URL } from "../../constants/urls";
import {
  budgetManagementFormDefaultValues,
  budgetManagementFormSchema,
} from "../../forms/schemas/budget_management.schema";
import type { BudgetManagementFormType } from "../../forms/schemas/budget_management.schema";
import {
  getAvailableBudgetCurrencyCodes,
  getBudgetManagement,
  saveBudget,
} from "../../sql/service/budgetService";
import { getCurrencyPreferences } from "../../sql/service/currencyManagementService";
import type { BudgetManageCategoryType } from "../../sql/types/budgetType";
import {
  compareAmounts,
  subtractAmounts,
  sumAmounts,
  toAmountString,
} from "../../utils/amount";
import { getMonthKey } from "../../utils/date";
import { DEBUG_TAG } from "../../utils/debugLog";

export default function useBudgetManagement() {
  const { id: planId } = useLocalSearchParams<{ id?: string }>();
  const queryClient = useQueryClient();
  const initializedCreateCurrency = useRef(false);
  const [allocations, setAllocations] = useState<Record<string, string>>({});
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rspErrorMsg, setRspErrorMsg] = useState("");

  const query = useQuery({
    queryKey: budgetQueryKeys.management(planId),
    queryFn: () => getBudgetManagement(planId),
  });
  const availableCurrenciesQuery = useQuery({
    queryKey: [...budgetQueryKeys.planList(), "availableCurrencies"],
    queryFn: getAvailableBudgetCurrencyCodes,
    enabled: !planId,
  });
  const preferencesQuery = useQuery({
    queryKey: currencyManagementQueryKeys.preferences(),
    queryFn: getCurrencyPreferences,
  });
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BudgetManagementFormType>({
    resolver: zodResolver(budgetManagementFormSchema),
    mode: "onChange",
    defaultValues: budgetManagementFormDefaultValues,
  });
  const totalBudgetInput = useWatch({ control, name: "totalBudget" });

  const availableCurrencyCodes = availableCurrenciesQuery.data ?? [];
  const currencyOptions = useMemo<SelectOptionType[]>(() => {
    const codes = new Set(
      planId && query.data?.currencyCode
        ? [query.data.currencyCode]
        : availableCurrencyCodes,
    );
    return CURRENCIES.filter(({ code }) => codes.has(code)).map((currency) => ({
      id: currency.code,
      label: `${currency.code} · ${currency.symbol}`,
      value: currency.code,
    }));
  }, [availableCurrencyCodes, planId, query.data?.currencyCode]);

  useEffect(() => {
    if (!query.data) return;
    if (query.data.budget) {
      reset({
        currencyCode: query.data.budget.currency_code,
        totalBudget: toAmountString(query.data.budget.total_budget),
        isActive: query.data.budget.is_active,
      });
    }
    setAllocations(
      Object.fromEntries(
        query.data.categories
          .filter((category) => compareAmounts(category.amount, 0) > 0)
          .map((category) => [
            category.category_id,
            toAmountString(category.amount),
          ]),
      ),
    );
  }, [query.data, reset]);

  useEffect(() => {
    if (
      planId ||
      initializedCreateCurrency.current ||
      !availableCurrenciesQuery.isFetched ||
      !preferencesQuery.isFetched
    )
      return;
    const preferredCode = preferencesQuery.data?.defaultCurrencyCode;
    const initialCode =
      (preferredCode && availableCurrencyCodes.includes(preferredCode)
        ? preferredCode
        : availableCurrencyCodes[0]) ?? "";
    setValue("currencyCode", initialCode, { shouldValidate: true });
    initializedCreateCurrency.current = true;
  }, [
    availableCurrenciesQuery.isFetched,
    availableCurrencyCodes,
    planId,
    preferencesQuery.data?.defaultCurrencyCode,
    preferencesQuery.isFetched,
    setValue,
  ]);

  useEffect(() => {
    if (!query.error) return;
    console.error(
      DEBUG_TAG.BUDGET,
      "Error when loading budget management",
      query.error,
    );
  }, [query.error]);

  const allocatedAmount = useMemo(
    () => sumAmounts(Object.values(allocations)),
    [allocations],
  );
  const selectedCategories = useMemo(
    () =>
      query.data?.categories.filter((category) =>
        Object.prototype.hasOwnProperty.call(allocations, category.category_id),
      ) ?? [],
    [allocations, query.data?.categories],
  );
  const availableCategories = useMemo(
    () =>
      query.data?.categories.filter(
        (category) =>
          !Object.prototype.hasOwnProperty.call(
            allocations,
            category.category_id,
          ),
      ) ?? [],
    [allocations, query.data?.categories],
  );
  const allocationDifference = subtractAmounts(
    totalBudgetInput,
    allocatedAmount,
  );

  const onAllocationChange = (categoryId: string, amount: string) =>
    setAllocations((current) => ({ ...current, [categoryId]: amount }));

  const onRemoveAllocation = (categoryId: string) => {
    setAllocations((current) => {
      const next = { ...current };
      delete next[categoryId];
      return next;
    });
  };

  const onSelectCategory = (category: BudgetManageCategoryType) => {
    setAllocations((current) => ({
      ...current,
      [category.category_id]: "0.00",
    }));
    setIsCategoryPickerVisible(false);
  };

  const onSubmit = async (value: BudgetManagementFormType) => {
    try {
      Keyboard.dismiss();
      setIsSaving(true);
      setRspErrorMsg("");
      const errorMessage = await saveBudget({
        planId,
        currencyCode: value.currencyCode,
        effectiveMonth: getMonthKey(),
        totalBudget: toAmountString(value.totalBudget),
        isActive: value.isActive,
        allocations: Object.entries(allocations).map(
          ([categoryId, amount]) => ({
            categoryId,
            amount: toAmountString(amount),
          }),
        ),
      });
      if (errorMessage) {
        setRspErrorMsg(errorMessage);
        return;
      }
      await Promise.all([
        invalidateQuery(queryClient, budgetQueryKeys.all),
        invalidateQuery(queryClient, budgetQueryKeys.planList()),
      ]);
      AppToast.success({ message: "Budget saved successfully" });
      router.replace(BUDGET_MANAGEMENT_LIST_URL as Href);
    } catch (error) {
      console.error(DEBUG_TAG.BUDGET, "Error when saving budget", error);
      AppToast.error({ message: "Unable to save budget" });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    allocatedAmount,
    allocationDifference,
    allocations,
    availableCategories,
    control,
    currencyOptions,
    errors,
    handleSubmit,
    hasCategories: Boolean(query.data?.categories.length),
    isCategoryPickerVisible,
    isCurrencyDisabled: query.data ? !query.data.isCurrencyEnabled : false,
    isCurrencyLocked: Boolean(planId),
    isError: query.isError,
    isLoading:
      query.isLoading ||
      (!planId &&
        (availableCurrenciesQuery.isLoading || preferencesQuery.isLoading)),
    isSaving,
    onAllocationChange,
    onDismissCategoryPicker: () => setIsCategoryPickerVisible(false),
    onOpenCategoryPicker: () => setIsCategoryPickerVisible(true),
    onRemoveAllocation,
    onRetry: () => void query.refetch(),
    onSelectCategory,
    onSubmit,
    rspErrorMsg,
    selectedCategories,
    showCurrencyField: true,
  };
}
