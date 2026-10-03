import { Control, Controller } from "react-hook-form";
import { Keyboard, StyleSheet, View } from "react-native";
import { TextInput, TouchableRipple } from "react-native-paper";
import AppIcon from "../../../components/AppIcon";
import { AppListItemType } from "../../../components/AppListView";
import AppText, { TextTypEnum } from "../../../components/AppText";
import { TEXTINPUT_HEIGHT } from "../../../constants/size";
import { TransactionManagementFormType } from "../../../forms/schemas/transaction_management.schema";
import { useThemeStore } from "../../../stores/useThemeStore";
import AccountPickerModal from "./AccountPickerModal";
import { useTranslation } from "../../../i18n/helper";

export type AccountFieldName = "accountId" | "fromAccountId" | "toAccountId";

export type AccountPickerItemType = AppListItemType & {
  balance: number;
  currencyCode?: string;
  inputLabel: string;
  typeId: string;
  typeLabel: string;
  typeIcon: AppListItemType["icon"];
  disabled?: boolean;
};

type AccountIdFieldProps = {
  className?: string;
  accountItems: AccountPickerItemType[];
  control: Control<TransactionManagementFormType>;
  error: Error | null;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isPickerVisible: boolean;
  isRefreshing: boolean;
  onDismissPicker: () => void;
  onLoadMore: () => void;
  onManageAccounts: () => void;
  onOpenPicker: () => void;
  onRefresh: () => Promise<unknown>;
  onSelectedAccountChange?: (account?: AccountPickerItemType) => void;
  fieldName?: AccountFieldName;
  headerLayout?: "default" | "category";
  label?: string;
  showQueryError?: boolean;
  disabled?: boolean;
};

export default function AccountIdField({
  className,
  accountItems,
  control,
  error: queryError,
  isFetchingNextPage,
  isLoading,
  isPickerVisible,
  isRefreshing,
  onDismissPicker,
  onLoadMore,
  onManageAccounts,
  onOpenPicker,
  onRefresh,
  onSelectedAccountChange,
  fieldName = "accountId",
  headerLayout = "default",
  label = "Account",
  showQueryError = true,
  disabled = false,
}: AccountIdFieldProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();

  return (
    <View className={className}>
      <Controller
        control={control}
        name={fieldName}
        render={({
          field: { value, onChange, onBlur, ref },
          fieldState: { error },
        }) => {
          const selectedAccount = accountItems.find(
            (account) => account.id.toString() === value,
          );

          return (
            <>
              <AccountPickerModal
                accounts={accountItems}
                error={queryError}
                isFetchingNextPage={isFetchingNextPage}
                isLoading={isLoading}
                isRefreshing={isRefreshing}
                onDismiss={onDismissPicker}
                onLoadMore={onLoadMore}
                onManageAccounts={onManageAccounts}
                onRefresh={onRefresh}
                onSelect={(account) => {
                  onChange(account.id.toString());
                  onSelectedAccountChange?.(account);
                  onBlur();
                  onDismissPicker();
                }}
                visible={isPickerVisible && !disabled}
                selectedItem={selectedAccount}
                title={t("Select {{label}}", { label: t(label) })}
              />

              {headerLayout === "category" ? (
                <TouchableRipple
                  accessibilityRole="button"
                  accessibilityLabel={t("Select {{label}}", {
                    label: t(label),
                  })}
                  accessibilityState={{
                    disabled,
                    expanded: isPickerVisible,
                  }}
                  disabled={disabled}
                  onPress={() => {
                    Keyboard.dismiss();
                    onOpenPicker();
                  }}
                  style={[
                    styles.categoryHeader,
                    {
                      backgroundColor: THEME.surfaceContainerHigh,
                      borderColor: error?.message
                        ? THEME.error
                        : isPickerVisible
                          ? THEME.primary
                          : THEME.outline,
                      borderWidth: isPickerVisible ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.categoryHeaderContent}>
                    <View style={styles.categoryHeaderLabel}>
                      {selectedAccount ? (
                        <AppIcon name={selectedAccount.typeIcon} size={24} />
                      ) : null}
                      <View style={styles.categoryHeaderText}>
                        <AppText variant="labelMedium">{t(label)}</AppText>
                        <AppText
                          variant="bodyLarge"
                          numberOfLines={1}
                          style={{
                            color: selectedAccount
                              ? THEME.onSurface
                              : THEME.onSurfaceVariant,
                          }}
                        >
                          {selectedAccount?.inputLabel ?? t("Please select")}
                        </AppText>
                      </View>
                    </View>
                    <AppIcon
                      name={isPickerVisible ? "ChevronUp" : "ChevronDown"}
                      color={THEME.onSurfaceVariant}
                      size={22}
                    />
                  </View>
                </TouchableRipple>
              ) : (
                <View className="mb-4">
                  <TextInput
                    ref={ref}
                    label={t(label)}
                    value={selectedAccount?.inputLabel ?? ""}
                    mode="outlined"
                    placeholder={t("Please select")}
                    showSoftInputOnFocus={false}
                    caretHidden
                    selection={{ start: 0, end: 0 }}
                    textAlign="left"
                    error={!!error?.message}
                    disabled={disabled}
                    onPress={() => {
                      Keyboard.dismiss();
                      onOpenPicker();
                    }}
                    onBlur={onBlur}
                    style={{
                      backgroundColor: THEME.surfaceContainerHigh,
                      height: TEXTINPUT_HEIGHT,
                    }}
                    right={
                      value ? (
                        <TextInput.Icon
                          icon="close"
                          disabled={disabled}
                          forceTextInputFocus={false}
                          onPress={() => {
                            onChange("");
                            onSelectedAccountChange?.(undefined);
                            onBlur();
                          }}
                        />
                      ) : (
                        <TextInput.Icon
                          icon="menu-up"
                          disabled={disabled}
                          forceTextInputFocus={false}
                          onPress={() => {
                            Keyboard.dismiss();
                            onOpenPicker();
                          }}
                        />
                      )
                    }
                  />
                </View>
              )}

              {error && (
                <AppText style={{ marginTop: -8 }} type={TextTypEnum.ERROR}>
                  {error.message}
                </AppText>
              )}
            </>
          );
        }}
      />

      {showQueryError && queryError && (
        <AppText type={TextTypEnum.ERROR} className="mb-4">
          Unable to load accounts.
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  categoryHeader: {
    borderRadius: 4,
    borderWidth: 1,
    height: 56,
    marginBottom: 10,
    marginTop: 6,
    overflow: "hidden",
  },
  categoryHeaderContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  categoryHeaderLabel: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  categoryHeaderText: { flex: 1 },
});
