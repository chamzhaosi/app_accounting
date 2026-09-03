import { StyleSheet, View } from "react-native";
import { SegmentedButtons, Surface, Text } from "react-native-paper";
import AppDatePicker from "../../../components/AppDatePicker";
import AppTextInput from "../../../components/AppTextInput";
import type { AppListCardItemType } from "../../../components/AppListCardView";
import type { BalanceChangeKind } from "../../../sql/types/accMgmtType";
import { useThemeStore } from "../../../stores/useThemeStore";
import { formatDateValue, parseDateValue } from "../../../utils/date";
import { useTranslation } from "../../../i18n/helper";
import { toAmountString, toBigAmount } from "../../../utils/amount";
import { CategoryCardPicker } from "../../transaction_management/_components/CategoryIdField";
import { DESCRIPTION_MAX_LEN } from "../../../forms/schemas/transaction_management.schema";
import RecentDescriptionPicker from "../../transaction_management/_components/RecentDescriptionPicker";
import { TransactionAttachmentAction } from "../../transaction_management/_components/TransactionAttachmentButton";

type BalanceChangeClassificationProps = {
  difference: number;
  kind?: BalanceChangeKind;
  categoryId: string;
  categoryOptions: AppListCardItemType[];
  description: string;
  recentDescriptions: string[];
  attachmentCount: number;
  attachmentDisabled: boolean;
  transactionDate: string;
  disabled: boolean;
  onKindChange: (kind: BalanceChangeKind) => void;
  onCategoryChange: (categoryId: string) => void;
  onDateChange: (date: string) => void;
  onDescriptionChange: (description: string) => void;
  onAttachmentPress: () => void;
};

export default function BalanceChangeClassification({
  difference,
  kind,
  categoryId,
  categoryOptions,
  description,
  recentDescriptions,
  attachmentCount,
  attachmentDisabled,
  transactionDate,
  disabled,
  onKindChange,
  onCategoryChange,
  onDateChange,
  onDescriptionChange,
  onAttachmentPress,
}: BalanceChangeClassificationProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  if (difference === 0) return null;

  const transactionKind = difference < 0 ? "expense" : "income";
  const amount = toAmountString(toBigAmount(difference).abs());

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
      <View style={styles.titleRow}>
        <Text variant="titleMedium" style={styles.title}>
          {t("Explain balance difference")}
        </Text>
        <TransactionAttachmentAction
          count={attachmentCount}
          disabled={attachmentDisabled}
          onPress={onAttachmentPress}
          style={styles.attachmentButton}
          iconSize={20}
        />
      </View>
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
            style: styles.segmentButton,
          },
          {
            value: "correction",
            label: t("Correction"),
            icon: "calculator",
            disabled,
            style: styles.segmentButton,
          },
        ]}
        style={styles.segmentedButtons}
      />

      {kind === transactionKind ? (
        <View>
          <CategoryCardPicker
            label="Category"
            value={categoryId}
            categoryItems={categoryOptions}
            disabled={disabled}
            onChange={onCategoryChange}
            useInternalScroll={false}
            leadingControl={
              <AppDatePicker
                mode="outlined"
                label="Transaction Date"
                value={parseDateValue(transactionDate)}
                disabled={disabled}
                onChange={(date) => onDateChange(formatDateValue(date))}
                withBottomSpacing={false}
              />
            }
          />
          <AppTextInput
            mode="outlined"
            label="Description"
            value={description}
            disabled={disabled}
            maxLength={DESCRIPTION_MAX_LEN}
            multiline
            numberOfLines={3}
            showClear
            showCounter={recentDescriptions.length === 0}
            outlineStyle={
              recentDescriptions.length > 0
                ? {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  }
                : undefined
            }
            onChangeText={onDescriptionChange}
          />
          <RecentDescriptionPicker
            descriptions={recentDescriptions}
            value={description}
            maxLength={DESCRIPTION_MAX_LEN}
            disabled={disabled}
            onSelect={onDescriptionChange}
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
  attachmentButton: { height: 36, marginRight: -8, marginTop: -8, width: 36 },
  description: { marginTop: 4 },
  segmentedButtons: { marginBottom: 16, marginTop: 12 },
  segmentButton: { flex: 1 },
  title: { flex: 1 },
  titleRow: { alignItems: "flex-start", flexDirection: "row" },
});
