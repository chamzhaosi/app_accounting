import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Keyboard } from "react-native";
import { AppToast } from "../../components/AppToast";
import { budgetQueryKeys, invalidateQuery } from "../../constants/queryKeys";
import {
  budgetManagementFormDefaultValues,
  budgetManagementFormSchema,
} from "../../forms/schemas/budget_management.schema";
import type { BudgetManagementFormType } from "../../forms/schemas/budget_management.schema";
import {
  getBudgetManagement,
  saveBudget,
} from "../../sql/service/budgetService";
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
  const month = getMonthKey();
  const queryClient = useQueryClient();
  const [allocations, setAllocations] = useState<Record<string, string>>({});
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rspErrorMsg, setRspErrorMsg] = useState("");
  const query = useQuery({
    queryKey: budgetQueryKeys.management(month),
    queryFn: () => getBudgetManagement(month),
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BudgetManagementFormType>({
    resolver: zodResolver(budgetManagementFormSchema),
    mode: "onChange",
    defaultValues: budgetManagementFormDefaultValues,
  });
  const totalBudgetInput = useWatch({ control, name: "totalBudget" });

  useEffect(() => {
    if (!query.data) return;
    reset({
      totalBudget: query.data.budget
        ? toAmountString(query.data.budget.total_budget)
        : "0.00",
      isActive: query.data.budget?.is_active ?? true,
    });
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
    if (query.error)
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

  const onAllocationChange = (categoryId: string, amount: string) => {
    setAllocations((current) => ({ ...current, [categoryId]: amount }));
  };

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
      const errMsg = await saveBudget({
        month,
        totalBudget: toAmountString(value.totalBudget),
        isActive: value.isActive,
        allocations: Object.entries(allocations).map(
          ([categoryId, amount]) => ({
            categoryId,
            amount: toAmountString(amount),
          }),
        ),
      });
      if (errMsg) {
        setRspErrorMsg(errMsg);
        return;
      }
      await Promise.all([
        invalidateQuery(queryClient, budgetQueryKeys.months()),
        invalidateQuery(queryClient, budgetQueryKeys.management(month)),
      ]);
      AppToast.success({ message: "Budget saved successfully" });
      router.back();
    } catch (e) {
      console.error(DEBUG_TAG.BUDGET, "Error when saving budget", e);
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
    errors,
    handleSubmit,
    hasCategories: Boolean(query.data?.categories.length),
    isCategoryPickerVisible,
    isError: query.isError,
    isLoading: query.isLoading,
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
  };
}
