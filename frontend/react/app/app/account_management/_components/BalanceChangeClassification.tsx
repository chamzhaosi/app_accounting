import { StyleSheet, View } from "react-native";
import { SegmentedButtons, Surface, Text } from "react-native-paper";
import AppDatePicker from "../../../components/AppDatePicker";
import AppSelect, { SelectOptionType } from "../../../components/AppSelect";
import type { BalanceChangeKind } from "../../../sql/types/accMgmtType";
import { useThemeStore } from "../../../stores/useThemeStore";
import { formatDateValue, parseDateValue } from "../../../utils/date";
import { useTranslation } from "../../../i18n";

type BalanceChangeClassificationProps = {
  difference: number;
  kind?: BalanceChangeKind;
  categoryId: string;
  categoryOptions: SelectOptionType[];
  transactionDate: string;
  disabled: boolean;
  onKindChange: (kind: BalanceChangeKind) => void;
  onCategoryChange: (categoryId: string) => void;
  onDateChange: (date: string) => void;
};

export default function BalanceChangeClassification({
  difference,
  kind,
  categoryId,
  categoryOptions,
  transactionDate,
  disabled,
  onKindChange,
  onCategoryChange,
  onDateChange,
}: BalanceChangeClassificationProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  if (difference === 0) return null;

  const transactionKind = difference < 0 ? "expense" : "income";
  const amount = Math.abs(difference).toFixed(2);

  return (
    <Surface
      elevation={0}
      style={[
        styles.container,
        {
          backgroundColor: THEME.surfaceContainerHigh,
          borderColor: THEME.outlineVariant,
        },
      ]}
    >
      <Text variant="titleMedium">{t("Explain balance difference")}</Text>
      <Text
        variant="bodyMedium"
        style={[styles.description, { color: THEME.onSurfaceVariant }]}
      >
        {t(
          "Balance {{direction}} by {{amount}}. Choose how it should appear in your records.",
          {
            direction: t(difference < 0 ? "decreased" : "increased"),
            amount,
          },
        )}
      </Text>

      <SegmentedButtons
        value={kind ?? ""}
        onValueChange={(value) => onKindChange(value as BalanceChangeKind)}
        buttons={[
          {
            value: transactionKind,
            label: t(`Missing ${transactionKind}`),
            icon: difference < 0 ? "arrow-up" : "arrow-down",
            disabled,
          },
          {
            value: "correction",
            label: t("Correction"),
            icon: "calculator",
            disabled,
          },
        ]}
        style={styles.segmentedButtons}
      />

      {kind === transactionKind ? (
        <View>
          <AppSelect
            mode="outlined"
            label={`${difference < 0 ? "Expense" : "Income"} Category`}
            value={categoryId}
            options={categoryOptions}
            disabled={disabled}
            showClear
            onChange={(value) => onCategoryChange(String(value ?? ""))}
          />
          <AppDatePicker
            mode="outlined"
            label="Transaction Date"
            value={parseDateValue(transactionDate)}
            disabled={disabled}
            onChange={(date) => onDateChange(formatDateValue(date))}
          />
          <Text variant="bodySmall" style={{ color: THEME.onSurfaceVariant }}>
            {t("This creates a normal {{kind}} and updates budget reports.", {
              kind: t(transactionKind),
            })}
          </Text>
        </View>
      ) : kind === "correction" ? (
        <Text variant="bodySmall" style={{ color: THEME.onSurfaceVariant }}>
          {t(
            "A bookkeeping correction changes the account balance without affecting the budget.",
          )}
        </Text>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
    padding: 14,
  },
  description: { marginTop: 4 },
  segmentedButtons: { marginBottom: 16, marginTop: 12 },
});
