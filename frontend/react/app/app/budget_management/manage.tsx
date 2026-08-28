import { Controller } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ActivityIndicator, Surface, Switch, Text } from "react-native-paper";
import AppAmtInput from "../../components/AppAmtInput";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppIcon, { AppIconProps } from "../../components/AppIcon";
import AppIconButton from "../../components/AppIconButton";
import AppSelect from "../../components/AppSelect";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppView from "../../components/AppView";
import useBudgetManagement from "../../hook/budget_management/useBudgetManagement";
import useSingleCurrencyMode from "../../hook/currency_management/useSingleCurrencyMode";
import { useThemeStore } from "../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../stores/useAmountPrivacyStore";
import { absoluteAmount } from "../../utils/amount";
import { formatPrivateCurrencyAmount } from "../../utils/number";
import BudgetCategoryPickerModal from "./_components/BudgetCategoryPickerModal";
import { useTranslation } from "../../i18n/helper";
import { getCategoryDisplayLabel } from "../../hook/category_management/categoryManagementList.utils";

export default function BudgetManagement() {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const {
    allocatedAmount,
    allocationDifference,
    allocations,
    amountDecimalPlaces,
    amountMaxLength,
    availableCategories,
    control,
    currencyCode,
    currencyOptions,
    handleSubmit,
    hasCategories,
    isCategoryPickerVisible,
    isCurrencyDisabled,
    isCurrencyLocked,
    isError,
    isLoading,
    isSaving,
    onAllocationChange,
    onCurrencyChange,
    onDismissCategoryPicker,
    onOpenCategoryPicker,
    onRemoveAllocation,
    onRetry,
    onSelectCategory,
    onSubmit,
    rspErrorMsg,
    selectedCategories,
    showCurrencyField,
    errors,
  } = useBudgetManagement();
  const isFormDisabled = isSaving || isCurrencyDisabled;

  if (isLoading) {
    return (
      <AppView className="items-center justify-center">
        <ActivityIndicator size="large" />
      </AppView>
    );
  }

  if (isError) {
    return (
      <AppView className="items-center justify-center p-6">
        <AppIcon name="CircleAlert" size={64} color={THEME.error} />
        <Text variant="headlineSmall" style={styles.errorTitle}>
          {t("Unable to load budget")}
        </Text>
        <AppButton
          {...SUBMIT_BTN_CONTENT_STYLE}
          onPress={onRetry}
          style={styles.retryButton}
        >
          Retry
        </AppButton>
      </AppView>
    );
  }

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
      <BudgetCategoryPickerModal
        categories={availableCategories}
        visible={isCategoryPickerVisible}
        onDismiss={onDismissCategoryPicker}
        onSelect={onSelectCategory}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Surface
          elevation={1}
          style={[styles.card, { backgroundColor: THEME.surfaceContainer }]}
        >
          {isCurrencyDisabled ? (
            <View
              style={[
                styles.disabledNotice,
                { backgroundColor: THEME.errorContainer },
              ]}
            >
              <AppIcon
                name="CircleAlert"
                size={20}
                color={THEME.onErrorContainer}
              />
              <Text style={{ color: THEME.onErrorContainer, flex: 1 }}>
                {t(
                  "This currency is disabled. Enable it in Currency Management before editing or reactivating this budget.",
                )}
              </Text>
            </View>
          ) : null}
          <View style={styles.budgetFields}>
            {showCurrencyField ? (
              <Controller
                control={control}
                name="currencyCode"
                render={({ field: { value } }) => (
                  <AppSelect
                    label="Currency"
                    value={value}
                    options={currencyOptions}
                    onChange={(nextValue) =>
                      onCurrencyChange(String(nextValue ?? ""))
                    }
                    errorField={errors.currencyCode}
                    showClear={false}
                    disabled={isFormDisabled || isCurrencyLocked}
                    containerStyle={styles.currencyField}
                  />
                )}
              />
            ) : null}
            <Controller
              control={control}
              name="totalBudget"
              render={({ field: { value, onBlur, onChange, ref } }) => (
                <View style={styles.totalBudgetContainer}>
                  <AppAmtInput
                    ref={ref}
                    mode="outlined"
                    label="Total monthly budget"
                    keyboardType="number-pad"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    errorField={errors.totalBudget}
                    editable={!isFormDisabled}
                    fixedDecimalInput
                    fixedDecimalPlaces={amountDecimalPlaces}
                    maxLength={amountMaxLength}
                    showClear
                    style={styles.totalBudgetField}
                  />
                </View>
              )}
            />
          </View>
          <Controller
            control={control}
            name="isActive"
            render={({ field: { value, onChange } }) => (
              <View style={styles.switchRow}>
                <View style={styles.flex}>
                  <Text variant="titleMedium">{t("Budget tracking")}</Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: THEME.onSurfaceVariant }}
                  >
                    {t("Pause tracking while keeping budget history.")}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  disabled={isFormDisabled}
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
          <SummaryValue
            label="Allocated"
            value={allocatedAmount}
            currencyCode={currencyCode}
          />
          <SummaryValue
            label={allocationDifference >= 0 ? "Unallocated" : "Overallocated"}
            value={absoluteAmount(allocationDifference)}
            currencyCode={currencyCode}
            color={allocationDifference < 0 ? THEME.error : THEME.primary}
          />
        </Surface>

        <Text variant="titleLarge" style={styles.sectionTitle}>
          {t("Expense allocations")}
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
              {getCategoryDisplayLabel(
                category.label,
                category.translation_key,
                t,
              )}
            </Text>
            <AppAmtInput
              mode="outlined"
              dense
              label="Amount"
              keyboardType="number-pad"
              value={allocations[category.category_id] ?? "0"}
              onChangeText={(text) =>
                onAllocationChange(category.category_id, text)
              }
              editable={!isFormDisabled}
              fixedDecimalInput
              fixedDecimalPlaces={amountDecimalPlaces}
              maxLength={amountMaxLength}
              showClear
              style={styles.amountInput}
            />
            <AppIconButton
              iconName="Trash2"
              accessibilityLabel={t("Remove {{name}} allocation", {
                name: getCategoryDisplayLabel(
                  category.label,
                  category.translation_key,
                  t,
                ),
              })}
              disabled={isFormDisabled}
              onPress={() => onRemoveAllocation(category.category_id)}
              style={styles.removeButton}
            />
          </Surface>
        ))}

        {selectedCategories.length === 0 && hasCategories ? (
          <Text
            variant="bodyMedium"
            style={[
              styles.emptyAllocationText,
              { color: THEME.onSurfaceVariant },
            ]}
          >
            {t(
              "No categories selected. Add the expense categories you want to track.",
            )}
          </Text>
        ) : null}
        {hasCategories ? (
          <AppButton
            {...SUBMIT_BTN_CONTENT_STYLE}
            variant={ButtonType.SECONDARY}
            icon="plus"
            disabled={isFormDisabled || availableCategories.length === 0}
            onPress={onOpenCategoryPicker}
            style={styles.addCategoryButton}
          >
            {availableCategories.length === 0
              ? "All Categories Added"
              : "Add Category"}
          </AppButton>
        ) : null}
        {!hasCategories && (
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
          disabled={isFormDisabled}
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
  currencyCode,
  color,
}: {
  label: string;
  value: number;
  currencyCode: string;
  color?: string;
}) {
  const { locale, t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const isSingleCurrency = useSingleCurrencyMode();
  return (
    <View style={styles.summaryValue}>
      <Text variant="labelLarge">{t(label)}</Text>
      <Text variant="titleLarge" style={color ? { color } : undefined}>
        {formatPrivateCurrencyAmount(
          value,
          currencyCode,
          locale,
          areAmountsVisible,
          !isSingleCurrency,
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  addCategoryButton: { borderRadius: 8, marginHorizontal: 12, marginTop: 8 },
  amountInput: { height: 48, width: 120 },
  budgetFields: { alignItems: "flex-start", flexDirection: "row", gap: 10 },
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
  currencyField: { flex: 1, minWidth: 0 },
  disabledNotice: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    padding: 12,
  },
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
  totalBudgetContainer: { flex: 1, minWidth: 0 },
  totalBudgetField: { width: "100%" },
});
