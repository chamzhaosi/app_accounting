import { Control, Controller } from "react-hook-form";
import { Keyboard, View } from "react-native";
import { TextInput } from "react-native-paper";
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
  label?: string;
  showQueryError?: boolean;
  disabled?: boolean;
};

export default function AccountIdField({
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
  label = "Account",
  showQueryError = true,
  disabled = false,
}: AccountIdFieldProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();

  return (
    <View className="flex-1">
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
