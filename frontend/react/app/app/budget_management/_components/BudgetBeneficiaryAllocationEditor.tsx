import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import AppAmtInput from "../../../components/AppAmtInput";
import AppIcon, { type AppIconProps } from "../../../components/AppIcon";
import { useTranslation } from "../../../i18n/helper";
import type { BeneficiaryRspType } from "../../../sql/types/beneficiaryType";
import { useThemeStore } from "../../../stores/useThemeStore";
import { subtractAmounts, sumAmounts } from "../../../utils/amount";
import { formatPrivateCurrencyAmount } from "../../../utils/number";
import { useAmountPrivacyStore } from "../../../stores/useAmountPrivacyStore";
import BeneficiarySelector from "../../beneficiary_management/_components/BeneficiarySelector";

type Props = {
  beneficiaries: BeneficiaryRspType[];
  allocations: Record<string, string>;
  categoryAmount: string;
  currencyCode: string;
  decimalPlaces: number;
  maxLength: number;
  disabled: boolean;
  onSelectionChange: (beneficiaryIds: string[]) => void;
  onAmountChange: (beneficiaryId: string, amount: string) => void;
};

export default function BudgetBeneficiaryAllocationEditor({
  beneficiaries,
  allocations,
  categoryAmount,
  currencyCode,
  decimalPlaces,
  maxLength,
  disabled,
  onSelectionChange,
  onAmountChange,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const { THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const selectedIds = Object.keys(allocations);
  const allocated = sumAmounts(Object.values(allocations));
  const unallocated = subtractAmounts(categoryAmount || 0, allocated);
  const display = (amount: number) =>
    formatPrivateCurrencyAmount(
      amount,
      currencyCode,
      locale,
      areAmountsVisible,
      true,
    );
  return (
    <View style={[styles.container, { borderTopColor: THEME.outlineVariant }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("Beneficiary Allocation")}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={styles.header}
      >
        <Text variant="labelLarge" style={{ color: THEME.primary }}>
          {t("Beneficiary Allocation")}
        </Text>
        <AppIcon name={expanded ? "ChevronUp" : "ChevronDown"} size={20} />
      </Pressable>
      {expanded ? (
        <View style={styles.content}>
          <BeneficiarySelector
            label="Beneficiaries"
            beneficiaries={beneficiaries}
            selectedIds={selectedIds}
            multiple
            headerLayout="category"
            presentation="modal"
            disabled={disabled}
            onChange={onSelectionChange}
          />
          {selectedIds.map((beneficiaryId) => {
            const beneficiary = beneficiaries.find(
              (item) => item.id === beneficiaryId,
            );
            if (!beneficiary) return null;
            return (
              <View key={beneficiaryId} style={styles.row}>
                <AppIcon
                  name={beneficiary.icon as AppIconProps["name"]}
                  size={20}
                />
                <Text numberOfLines={1} style={styles.name}>
                  {beneficiary.name}
                </Text>
                <View style={styles.amountContainer}>
                  <AppAmtInput
                    mode="outlined"
                    dense
                    label="Amount"
                    keyboardType="number-pad"
                    value={allocations[beneficiaryId]}
                    onChangeText={(amount) =>
                      onAmountChange(beneficiaryId, amount)
                    }
                    editable={!disabled}
                    fixedDecimalInput
                    fixedDecimalPlaces={decimalPlaces}
                    maxLength={maxLength}
                    showClear
                    style={styles.amount}
                  />
                </View>
              </View>
            );
          })}
          <View style={styles.summary}>
            <Text variant="bodySmall">
              {t("Beneficiary allocated")}: {display(allocated)}
            </Text>
            <Text
              variant="bodySmall"
              style={{
                color: unallocated < 0 ? THEME.error : THEME.onSurfaceVariant,
              }}
            >
              {t(unallocated < 0 ? "Overallocated" : "Unallocated")}:{" "}
              {display(Math.abs(unallocated))}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  amount: { height: 46, width: "100%" },
  amountContainer: { minWidth: 0, width: "50%" },
  container: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 10 },
  content: { paddingTop: 8 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  name: { flex: 1, marginHorizontal: 8 },
  row: { alignItems: "center", flexDirection: "row", marginBottom: 8 },
  summary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
});
