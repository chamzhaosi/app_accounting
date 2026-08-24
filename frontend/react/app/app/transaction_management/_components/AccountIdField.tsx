import { Control, Controller } from "react-hook-form";
import { Keyboard, View } from "react-native";
import { TextInput } from "react-native-paper";
import { AppListItemType } from "../../../components/AppListView";
import AppText, { TextTypEnum } from "../../../components/AppText";
import { TEXTINPUT_HEIGHT } from "../../../constants/size";
import { TransactionManagementFormType } from "../../../forms/schemas/transaction_management.schema";
import { useThemeStore } from "../../../stores/useThemeStore";
import AccountPickerModal from "./AccountPickerModal";
import { useTranslation } from "../../../i18n";

export type AccountFieldName = "accountId" | "fromAccountId" | "toAccountId";

export type AccountPickerItemType = AppListItemType & {
  balance: number;
  inputLabel: string;
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
  fieldName?: AccountFieldName;
  label?: string;
  showQueryError?: boolean;
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
  fieldName = "accountId",
  label = "Account",
  showQueryError = true,
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
                  onBlur();
                  onDismissPicker();
                }}
                visible={isPickerVisible}
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
                  error={!!error?.message}
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
                        forceTextInputFocus={false}
                        onPress={() => {
                          onChange("");
                          onBlur();
                        }}
                      />
                    ) : (
                      <TextInput.Icon
                        icon="menu-up"
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
