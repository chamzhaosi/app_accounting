import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Keyboard, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ActivityIndicator, Surface, Switch, Text } from "react-native-paper";
import AppAmtInput from "../../components/AppAmtInput";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppIcon, { AppIconProps } from "../../components/AppIcon";
import AppIconButton from "../../components/AppIconButton";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppView from "../../components/AppView";
import { budgetQueryKeys, invalidateQuery } from "../../constants/queryKeys";
import {
  budgetManagementFormDefaultValues,
  budgetManagementFormSchema,
  BudgetManagementFormType,
} from "../../forms/schemas/budget_management.schema";
import {
  getBudgetManagement,
  saveBudget,
} from "../../sql/service/budgetService";
import { AppToast } from "../../components/AppToast";
import { useThemeStore } from "../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../stores/useAmountPrivacyStore";
import { getMonthKey } from "../../utils/date";
import { DEBUG_TAG } from "../../utils/debugLog";
import { formatPrivateAmount } from "../../utils/number";
import BudgetCategoryPickerModal from "./_components/BudgetCategoryPickerModal";

const AMOUNT_MAX_LENGTH = 11;

export default function BudgetManagement() {
  const month = getMonthKey();
  const [allocations, setAllocations] = useState<Record<string, string>>({});
  const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rspErrorMsg, setRspErrorMsg] = useState("");
  const { THEME } = useThemeStore();
  const queryClient = useQueryClient();
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
        ? query.data.budget.total_budget.toFixed(2)
        : "0.00",
      isActive: query.data.budget?.is_active ?? true,
    });
    setAllocations(
      Object.fromEntries(
        query.data.categories
          .filter((category) => category.amount > 0)
          .map((category) => [
            category.category_id,
            category.amount.toFixed(2),
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
    () =>
      Object.values(allocations).reduce(
        (total, value) => total + (Number(value) || 0),
        0,
      ),
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

  const onSubmit = async (value: BudgetManagementFormType) => {
    try {
      Keyboard.dismiss();
      setIsSaving(true);
      setRspErrorMsg("");
      const errMsg = await saveBudget({
        month,
        totalBudget: Number(value.totalBudget),
        isActive: value.isActive,
        allocations: Object.entries(allocations).map(
          ([categoryId, amount]) => ({
            categoryId,
            amount: Number(amount) || 0,
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

  if (query.isLoading) {
    return (
      <AppView className="items-center justify-center">
        <ActivityIndicator size="large" />
      </AppView>
    );
  }

  if (query.isError) {
    return (
      <AppView className="items-center justify-center p-6">
        <AppIcon name="CircleAlert" size={64} color={THEME.error} />
        <Text variant="headlineSmall" style={styles.errorTitle}>
          Unable to load budget
        </Text>
        <AppButton
          {...SUBMIT_BTN_CONTENT_STYLE}
          onPress={() => void query.refetch()}
          style={styles.retryButton}
        >
          Retry
        </AppButton>
      </AppView>
    );
  }

  const totalBudgetValue = Number(totalBudgetInput) || 0;
  const allocationDifference = totalBudgetValue - allocatedAmount;

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
      <BudgetCategoryPickerModal
        categories={availableCategories}
        visible={isCategoryPickerVisible}
        onDismiss={() => setIsCategoryPickerVisible(false)}
        onSelect={(category) => {
          setAllocations((current) => ({
            ...current,
            [category.category_id]: "0.00",
          }));
          setIsCategoryPickerVisible(false);
        }}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Surface
          elevation={1}
          style={[styles.card, { backgroundColor: THEME.surfaceContainer }]}
        >
          <Controller
            control={control}
            name="totalBudget"
            render={({ field: { value, onBlur, onChange, ref } }) => (
              <AppAmtInput
                ref={ref}
                mode="outlined"
                label="Total monthly budget"
                keyboardType="number-pad"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                errorField={errors.totalBudget}
                editable={!isSaving}
                fixedDecimalInput
                maxLength={AMOUNT_MAX_LENGTH}
                showClear
              />
            )}
          />
          <Controller
            control={control}
            name="isActive"
            render={({ field: { value, onChange } }) => (
              <View style={styles.switchRow}>
                <View style={styles.flex}>
                  <Text variant="titleMedium">Budget tracking</Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: THEME.onSurfaceVariant }}
                  >
                    Pause tracking without removing this month’s plan.
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  disabled={isSaving}
                />
              </View>
            )}
          />
        </Surface>

        <Surface
          elevation={1}
          style={[
            styles.summaryCard,
            { backgroundColor: THEME.secondaryContainer },
          ]}
        >
          <SummaryValue label="Allocated" value={allocatedAmount} />
          <SummaryValue
            label={allocationDifference >= 0 ? "Unallocated" : "Overallocated"}
            value={Math.abs(allocationDifference)}
            color={allocationDifference < 0 ? THEME.error : THEME.primary}
          />
        </Surface>

        <Text variant="titleLarge" style={styles.sectionTitle}>
          Expense allocations
        </Text>
        {selectedCategories.map((category) => (
          <Surface
            key={category.category_id}
            elevation={0}
            style={[
              styles.categoryRow,
              { backgroundColor: THEME.surfaceContainer },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: THEME.surfaceContainerHighest },
              ]}
            >
              <AppIcon name={category.icon as AppIconProps["name"]} size={22} />
            </View>
            <Text variant="titleMedium" style={styles.categoryLabel}>
              {category.label}
            </Text>
            <AppAmtInput
              mode="outlined"
              dense
              label="Amount"
              keyboardType="number-pad"
              value={allocations[category.category_id] ?? "0.00"}
              onChangeText={(text) =>
                setAllocations((current) => ({
                  ...current,
                  [category.category_id]: text,
                }))
              }
              editable={!isSaving}
              fixedDecimalInput
              maxLength={AMOUNT_MAX_LENGTH}
              showClear
              style={styles.amountInput}
            />
            <AppIconButton
              iconName="Trash2"
              accessibilityLabel={`Remove ${category.label} allocation`}
              disabled={isSaving}
              onPress={() =>
                setAllocations((current) => {
                  const next = { ...current };
                  delete next[category.category_id];
                  return next;
                })
              }
              style={styles.removeButton}
            />
          </Surface>
        ))}

        {selectedCategories.length === 0 && query.data?.categories.length ? (
          <Text
            variant="bodyMedium"
            style={[
              styles.emptyAllocationText,
              { color: THEME.onSurfaceVariant },
            ]}
          >
            No categories selected. Add the expense categories you want to
            track.
          </Text>
        ) : null}
        {query.data?.categories.length ? (
          <AppButton
            {...SUBMIT_BTN_CONTENT_STYLE}
            variant={ButtonType.SECONDARY}
            icon="plus"
            disabled={isSaving || availableCategories.length === 0}
            onPress={() => setIsCategoryPickerVisible(true)}
            style={styles.addCategoryButton}
          >
            {availableCategories.length === 0
              ? "All Categories Added"
              : "Add Category"}
          </AppButton>
        ) : null}
        {query.data?.categories.length === 0 && (
          <AppText type={TextTypEnum.ERROR}>
            Create an active expense category before setting allocations.
          </AppText>
        )}
        {rspErrorMsg ? (
          <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
        ) : null}
        <AppButton
          {...SUBMIT_BTN_CONTENT_STYLE}
          loading={isSaving}
          disabled={isSaving}
          onPress={handleSubmit(onSubmit)}
          style={styles.saveButton}
        >
          Save Budget
        </AppButton>
      </KeyboardAwareScrollView>
    </AppView>
  );
}

function SummaryValue({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  return (
    <View style={styles.summaryValue}>
      <Text variant="labelLarge">{label}</Text>
      <Text variant="titleLarge" style={color ? { color } : undefined}>
        {formatPrivateAmount(value, areAmountsVisible)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  addCategoryButton: { borderRadius: 8, marginHorizontal: 12, marginTop: 8 },
  amountInput: { height: 48, width: 120 },
  card: { borderRadius: 16, margin: 12, padding: 16 },
  categoryLabel: { flex: 1, marginHorizontal: 12 },
  categoryRow: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 10,
  },
  content: { paddingBottom: 32 },
  emptyAllocationText: {
    marginHorizontal: 24,
    marginVertical: 16,
    textAlign: "center",
  },
  errorTitle: { marginTop: 16 },
  flex: { flex: 1 },
  iconContainer: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  saveButton: { borderRadius: 8, margin: 12, marginTop: 20 },
  retryButton: { borderRadius: 8, marginTop: 20, width: "100%" },
  removeButton: { marginLeft: 8, padding: 8 },
  sectionTitle: { margin: 12, marginBottom: 8 },
  summaryCard: {
    borderRadius: 16,
    flexDirection: "row",
    marginHorizontal: 12,
    padding: 16,
  },
  summaryValue: { flex: 1 },
  switchRow: { alignItems: "center", flexDirection: "row", marginTop: 16 },
});
