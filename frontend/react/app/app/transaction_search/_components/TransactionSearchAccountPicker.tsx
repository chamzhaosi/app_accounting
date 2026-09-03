import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TouchableRipple } from "react-native-paper";
import AppIcon from "../../../components/AppIcon";
import AppText from "../../../components/AppText";
import { useTranslation } from "../../../i18n/helper";
import { useThemeStore } from "../../../stores/useThemeStore";
import AccountPickerModal, {
  type AccountPickerModalItem,
} from "../../transaction_management/_components/AccountPickerModal";

type TransactionSearchAccountPickerProps = {
  accounts: AccountPickerModalItem[];
  onChange: (accountIds: string[]) => void;
  value: string[];
};

export default function TransactionSearchAccountPicker({
  accounts,
  onChange,
  value,
}: TransactionSearchAccountPickerProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const selectedAccounts = accounts.filter((account) =>
    value.includes(account.id.toString()),
  );
  const selectedAccount = selectedAccounts[0];
  const selectedLabel =
    selectedAccounts.length > 1
      ? t("{{count}} selected", { count: selectedAccounts.length })
      : selectedAccount?.inputLabel;

  return (
    <>
      <TouchableRipple
        accessibilityRole="button"
        accessibilityLabel={t("Select Account")}
        onPress={() => setVisible(true)}
        style={[
          styles.field,
          {
            backgroundColor: THEME.surfaceContainerHigh,
            borderColor: THEME.outline,
          },
        ]}
      >
        <View style={styles.fieldContent}>
          <View style={styles.fieldLabel}>
            {selectedAccount ? (
              <AppIcon name={selectedAccount.typeIcon} size={22} />
            ) : null}
            <View style={styles.fieldText}>
              <AppText variant="labelMedium">{t("Account")}</AppText>
              <AppText
                variant="bodyLarge"
                numberOfLines={1}
                style={{
                  color: selectedAccount
                    ? THEME.onSurface
                    : THEME.onSurfaceVariant,
                }}
              >
                {selectedLabel ?? t("Please select")}
              </AppText>
            </View>
          </View>
          {selectedAccount ? (
            <TouchableRipple
              accessibilityRole="button"
              accessibilityLabel={t("Clear account")}
              borderless
              onPress={() => onChange([])}
              style={styles.clearButton}
            >
              <AppIcon name="X" size={18} color={THEME.onSurfaceVariant} />
            </TouchableRipple>
          ) : (
            <AppIcon
              name="ChevronDown"
              size={22}
              color={THEME.onSurfaceVariant}
            />
          )}
        </View>
      </TouchableRipple>

      <AccountPickerModal
        accounts={accounts}
        error={null}
        isFetchingNextPage={false}
        isLoading={false}
        isRefreshing={false}
        onDismiss={() => setVisible(false)}
        onLoadMore={() => undefined}
        onRefresh={async () => undefined}
        onSelect={(account) => {
          const accountId = account.id.toString();
          onChange(
            value.includes(accountId)
              ? value.filter((id) => id !== accountId)
              : [...value, accountId],
          );
        }}
        selectedItems={selectedAccounts}
        title={t("Select Account")}
        visible={visible}
      />
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    minHeight: 56,
    overflow: "hidden",
  },
  fieldContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  fieldLabel: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },
  fieldText: { flex: 1, minWidth: 0 },
  clearButton: {
    alignItems: "center",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
});
