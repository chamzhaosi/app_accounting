import { useEffect, useState } from "react";
import { Keyboard, StyleSheet, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Modal, Portal, Text } from "react-native-paper";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../../components/AppButton";
import AppDateRangePicker from "../../../components/AppDateRangePicker";
import AppIconButton from "../../../components/AppIconButton";
import type { SelectOptionType } from "../../../components/AppSelect";
import AppTextInput from "../../../components/AppTextInput";
import { useTranslation } from "../../../i18n/helper";
import type { TransactionSearchFilters } from "../../../sql/types/transactionSearchType";
import { useThemeStore } from "../../../stores/useThemeStore";
import { formatDateValue, parseDateValue } from "../../../utils/date";
import type { AccountPickerModalItem } from "../../transaction_management/_components/AccountPickerModal";
import TransactionSearchAccountPicker from "./TransactionSearchAccountPicker";
import TransactionSearchCategoryPicker from "./TransactionSearchCategoryPicker";
import TransactionSearchMultiSelect from "./TransactionSearchMultiSelect";

type TransactionSearchFiltersProps = {
  visible: boolean;
  filters: TransactionSearchFilters;
  filterError?: string;
  accountPickerItems: AccountPickerModalItem[];
  categoryOptions: SelectOptionType[];
  currencyOptions: SelectOptionType[];
  transactionTypeOptions: SelectOptionType[];
  onApply: (filters: TransactionSearchFilters) => boolean;
  onDismiss: () => void;
  onReset: () => void;
};

export default function TransactionSearchFilters({
  visible,
  filters,
  filterError,
  accountPickerItems,
  categoryOptions,
  currencyOptions,
  transactionTypeOptions,
  onApply,
  onDismiss,
  onReset,
}: TransactionSearchFiltersProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const [draft, setDraft] = useState(filters);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDraft(filters);
  }, [filters, visible]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardVisible(true),
    );
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.sheet,
          {
            backgroundColor: THEME.surfaceContainer,
            ...(isKeyboardVisible
              ? { height: height * 0.92 }
              : { maxHeight: height * 0.92 }),
          },
        ]}
      >
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ color: THEME.onSurface }}>
            {t("Filters")}
          </Text>
          <AppIconButton
            iconName="X"
            accessibilityLabel={t("Dismiss filters")}
            onPress={onDismiss}
            style={{ backgroundColor: THEME.surfaceContainer }}
          />
        </View>

        <KeyboardAwareScrollView
          enableOnAndroid
          enableAutomaticScroll
          extraScrollHeight={100}
          keyboardShouldPersistTaps="handled"
          style={[
            styles.scroll,
            isKeyboardVisible ? styles.expandedScroll : undefined,
          ]}
          contentContainerStyle={styles.content}
        >
          <AppDateRangePicker
            label={t("Date range")}
            value={{
              startDate: parseDateValue(draft.startDate),
              endDate: parseDateValue(draft.endDate),
            }}
            disableFutureDates
            onChange={(range) =>
              setDraft((current) => ({
                ...current,
                startDate: formatDateValue(range.startDate) || undefined,
                endDate: formatDateValue(range.endDate) || undefined,
              }))
            }
          />
          {draft.startDate || draft.endDate ? (
            <AppButton
              mode="text"
              compact
              onPress={() =>
                setDraft((current) => ({
                  ...current,
                  startDate: undefined,
                  endDate: undefined,
                }))
              }
              style={styles.clearDateButton}
              labelStyle={styles.textButtonLabel}
              contentStyle={styles.textButtonContent}
            >
              {t("Clear date range")}
            </AppButton>
          ) : null}
          <TransactionSearchCategoryPicker
            categories={categoryOptions}
            leadingControl={
              <TransactionSearchAccountPicker
                accounts={accountPickerItems}
                value={draft.accountIds ?? []}
                onChange={(accountIds) =>
                  setDraft((current) => ({ ...current, accountIds }))
                }
              />
            }
            value={draft.categoryIds ?? []}
            onChange={(categoryIds) =>
              setDraft((current) => ({ ...current, categoryIds }))
            }
          />
          <View style={styles.selectRows}>
            <TransactionSearchMultiSelect
              label={t("Transaction type")}
              values={draft.transactionTypes ?? []}
              options={transactionTypeOptions}
              onChange={(values) =>
                setDraft((current) => ({
                  ...current,
                  transactionTypes: values as NonNullable<
                    TransactionSearchFilters["transactionTypes"]
                  >,
                }))
              }
            />
            <TransactionSearchMultiSelect
              label={t("Currency")}
              values={draft.currencyCodes ?? []}
              options={currencyOptions}
              onChange={(currencyCodes) =>
                setDraft((current) => ({
                  ...current,
                  currencyCodes,
                }))
              }
            />
          </View>
          <View style={styles.amountRow}>
            <AppTextInput
              label={t("Min Amount")}
              value={draft.minimumAmount ?? ""}
              keyboardType="decimal-pad"
              showClear
              showCounter={false}
              onChangeText={(value) =>
                setDraft((current) => ({
                  ...current,
                  minimumAmount: value,
                }))
              }
              style={styles.amountInput}
            />
            <AppTextInput
              label={t("Max Amount")}
              value={draft.maximumAmount ?? ""}
              keyboardType="decimal-pad"
              showClear
              showCounter={false}
              onChangeText={(value) =>
                setDraft((current) => ({
                  ...current,
                  maximumAmount: value,
                }))
              }
              style={styles.amountInput}
            />
          </View>
          {filterError ? (
            <Text style={[styles.error, { color: THEME.error }]}>
              {t(filterError)}
            </Text>
          ) : null}
        </KeyboardAwareScrollView>

        <View style={styles.actions}>
          <AppButton
            {...SUBMIT_BTN_CONTENT_STYLE}
            variant={ButtonType.SECONDARY}
            style={styles.actionButton}
            onPress={() => {
              setDraft({});
              onReset();
            }}
          >
            {t("Reset Filters")}
          </AppButton>
          <AppButton
            {...SUBMIT_BTN_CONTENT_STYLE}
            style={styles.actionButton}
            onPress={() => {
              if (onApply(draft)) onDismiss();
            }}
          >
            {t("Apply Filters")}
          </AppButton>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    bottom: 0,
    left: 0,
    paddingBottom: 16,
    position: "absolute",
    right: 0,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  content: { paddingHorizontal: 20, paddingBottom: 16 },
  scroll: { flexShrink: 1 },
  expandedScroll: { flex: 1 },
  clearDateButton: { alignSelf: "flex-end", marginBottom: 8, marginTop: -12 },
  textButtonLabel: { fontSize: 14 },
  textButtonContent: { marginVertical: 0 },
  selectRows: { gap: 12, marginTop: 12 },
  amountRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  amountInput: { flex: 1 },
  error: { marginBottom: 8 },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  actionButton: { flex: 1, borderRadius: 8 },
});
