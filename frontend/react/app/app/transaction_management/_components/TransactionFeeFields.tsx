import type { FieldArrayWithId, UseFieldArrayRemove } from "react-hook-form";
import { Controller, type Control } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import AppAmtInput from "../../../components/AppAmtInput";
import AppButton, { ButtonType } from "../../../components/AppButton";
import type { AppIconProps } from "../../../components/AppIcon";
import AppIconButton from "../../../components/AppIconButton";
import type { SelectOptionType } from "../../../components/AppSelect";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import { AMOUNT_MAX_LEN } from "../../../forms/schemas/transaction_management.schema";
import type { TransactionManagementFormType } from "../../../forms/schemas/transaction_management.schema";
import { useThemeStore } from "../../../stores/useThemeStore";
import { useTranslation } from "../../../i18n/helper";
import { CategoryCardPicker } from "./CategoryIdField";

type TransactionFeeFieldsProps = {
  categoryOptions: SelectOptionType[];
  control: Control<TransactionManagementFormType>;
  currencyCode: string;
  fields: FieldArrayWithId<TransactionManagementFormType, "fees", "id">[];
  onAdd: () => void;
  onRemove: UseFieldArrayRemove;
  onManageCategories: () => void;
};

export default function TransactionFeeFields({
  categoryOptions,
  control,
  currencyCode,
  fields,
  onAdd,
  onRemove,
  onManageCategories,
}: TransactionFeeFieldsProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const categoryItems = categoryOptions.map((category) => ({
    id: category.id,
    icon: (category.icon ?? "Tag") as AppIconProps["name"],
    label: category.label,
  }));

  return (
    <View style={styles.section}>
      {fields.map((field, index) => (
        <View
          key={field.id}
          style={[
            styles.feeCard,
            {
              backgroundColor: THEME.surfaceContainerHigh,
              borderColor: THEME.outlineVariant,
            },
          ]}
        >
          <View style={styles.feeHeader}>
            <AppText variant="titleMedium">
              {t("Fee {{number}}", { number: index + 1 })}
            </AppText>
            <AppIconButton
              iconName="Trash2"
              iconSize={20}
              accessibilityLabel={t("Remove Fee")}
              onPress={() => onRemove(index)}
            />
          </View>

          <Controller
            control={control}
            name={`fees.${index}.categoryId`}
            render={({ field: categoryField, fieldState: { error } }) => (
              <CategoryCardPicker
                label="Fee Category"
                categoryItems={categoryItems}
                value={categoryField.value}
                errorMessage={error?.message}
                onChange={(categoryId) => {
                  categoryField.onChange(categoryId);
                  categoryField.onBlur();
                }}
                onManageCategories={onManageCategories}
              />
            )}
          />

          <View style={styles.row}>
            <View style={styles.flexField}>
              <AppTextInput
                mode="outlined"
                label="Currency"
                value={currencyCode}
                disabled
              />
            </View>

            <Controller
              control={control}
              name={`fees.${index}.amount`}
              render={({ field: amountField, fieldState: { error } }) => (
                <View style={styles.flexField}>
                  <AppAmtInput
                    mode="outlined"
                    label={`${t("Fee Amount")}${currencyCode ? ` (${currencyCode})` : ""}`}
                    value={amountField.value}
                    onChangeText={amountField.onChange}
                    onBlur={amountField.onBlur}
                    maxLength={AMOUNT_MAX_LEN}
                    keyboardType="number-pad"
                    fixedDecimalInput
                    showClear
                    errorField={error}
                  />
                </View>
              )}
            />
          </View>
        </View>
      ))}

      <AppButton
        icon="plus"
        compact
        variant={ButtonType.SECONDARY}
        onPress={onAdd}
        contentStyle={styles.addButtonContent}
        labelStyle={styles.addButtonLabel}
        style={styles.addButton}
      >
        {fields.length ? "Add Another Fee" : "Add Fee"}
      </AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: { alignSelf: "flex-start", borderRadius: 4 },
  addButtonContent: { height: 40, marginVertical: 0 },
  addButtonLabel: { fontSize: 14 },
  feeCard: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    padding: 12,
  },
  feeHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  flexField: { flex: 1 },
  row: { flexDirection: "row", gap: 8, marginBottom: 8 },
  section: { marginBottom: 16 },
});
