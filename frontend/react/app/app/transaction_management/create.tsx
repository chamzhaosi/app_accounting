import dayjs from "dayjs";
import type { ReactNode } from "react";
import { Controller } from "react-hook-form";
import { View } from "react-native";
import { SegmentedButtons, TextInput } from "react-native-paper";
import AppAmtInput from "../../components/AppAmtInput";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDatePicker from "../../components/AppDatePicker";
import AppIcon from "../../components/AppIcon";
import AppScrollView from "../../components/AppScrollView";
import AppSelect from "../../components/AppSelect";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import { TEXTINPUT_HEIGHT } from "../../constants/size";
import {
  DESCRIPTION_MAX_LEN,
  EXCHANGE_RATE_MAX_LEN,
} from "../../forms/schemas/transaction_management.schema";
import { getCurrencyDecimalDigits } from "../../constants/currencies";
import { getAmountMaxLength } from "../../utils/amount";
import useTransactionManagementCreate from "../../hook/transaction_management/useTransactionManagementCreate";
import { useTranslation } from "../../i18n/helper";
import { EXCHANGE_RATE_ZERO } from "../../utils/exchangeRate";
import AccountIdField from "./_components/AccountIdField";
import CategoryIdField from "./_components/CategoryIdField";
import TransactionFeeFields from "./_components/TransactionFeeFields";

type TransactionFormScreenLogic = Omit<
  ReturnType<typeof useTransactionManagementCreate>,
  "isSaving" | "isSavingAndNew" | "isSubmitting" | "onSubmit"
>;

type TransactionFormScreenProps = {
  footer: ReactNode;
  logic: TransactionFormScreenLogic;
};

export function TransactionFormScreen({
  footer,
  logic,
}: TransactionFormScreenProps) {
  const { t } = useTranslation();
  const {
    accountCurrencyCode,
    accountFieldProps,
    activeAccountField,
    categoryError,
    categoryItems,
    clearErrors,
    control,
    currencyCode,
    currencyOptions,
    feeCategoryOptions,
    feeFields,
    isAccountPickerVisible,
    isLoadingCategories,
    isLoadingRateSuggestion,
    isSubmitted,
    onManageCategories,
    openAccountPicker,
    rateSuggestionLabel,
    responseError,
    setValue,
    showCurrencyField,
    transactionType,
    usesExchangeRate,
  } = logic;

  const renderTransactionDate = () => (
    <Controller
      control={control}
      name="transactionDate"
      render={({
        field: { value, onChange, onBlur, ref },
        fieldState: { error },
      }) => (
        <AppDatePicker
          ref={ref}
          mode="outlined"
          label="Transaction Date"
          value={dayjs(value).toDate()}
          onChange={(date) => onChange(dayjs(date).format("YYYY-MM-DD"))}
          onBlur={onBlur}
          errorField={error}
        />
      )}
    />
  );

  const renderOriginalAmount = () => {
    const label =
      transactionType === TXN_TYPE_ENUM.TRANSFER ? "Amount Sent" : "Amount";

    return (
      <Controller
        control={control}
        name="amount"
        render={({ field: { value, onBlur, ref }, fieldState: { error } }) => (
          <AppAmtInput
            ref={ref}
            continerClassName="mb-4"
            mode="outlined"
            label={`${t(label)}${currencyCode ? ` (${currencyCode})` : ""}`}
            value={value}
            onChangeText={logic.onAmountChange}
            onBlur={onBlur}
            maxLength={getAmountMaxLength(currencyCode)}
            keyboardType="number-pad"
            showClear
            errorField={error}
            fixedDecimalInput
            fixedDecimalPlaces={getCurrencyDecimalDigits(currencyCode)}
          />
        )}
      />
    );
  };

  const renderAccountAmount = () => {
    const label =
      transactionType === TXN_TYPE_ENUM.TRANSFER ? "Amount Received" : "Amount";

    return (
      <Controller
        control={control}
        name="convertedAmount"
        render={({
          field: { value, onBlur, ref },
          fieldState: { error, isTouched },
        }) => (
          <AppAmtInput
            ref={ref}
            continerClassName="mb-4"
            mode="outlined"
            label={`${t(label)} (${accountCurrencyCode})`}
            value={value}
            onChangeText={logic.onConvertedAmountChange}
            onBlur={onBlur}
            maxLength={getAmountMaxLength(accountCurrencyCode)}
            keyboardType="number-pad"
            showClear
            errorField={isTouched || isSubmitted ? error : undefined}
            fixedDecimalInput
            fixedDecimalPlaces={getCurrencyDecimalDigits(accountCurrencyCode)}
          />
        )}
      />
    );
  };

  const renderExchangeRate = () => (
    <Controller
      control={control}
      name="exchangeRate"
      render={({
        field: { value, onBlur },
        fieldState: { error, isTouched },
      }) => (
        <>
          <AppAmtInput
            mode="outlined"
            label={`${t("Rate")} (${currencyCode} → ${accountCurrencyCode})`}
            value={value}
            onChangeText={logic.onExchangeRateChange}
            onBlur={() => {
              logic.onExchangeRateBlur();
              onBlur();
            }}
            maxLength={EXCHANGE_RATE_MAX_LEN}
            keyboardType="number-pad"
            errorField={isTouched || isSubmitted ? error : undefined}
            fixedDecimalInput
            fixedDecimalPlaces={6}
            right={
              <TextInput.Icon
                icon="history"
                disabled={isLoadingRateSuggestion}
                onPress={() => void logic.onUsePreviousRate()}
              />
            }
          />
          {rateSuggestionLabel && (
            <AppText variant="labelSmall" className="mb-3 ms-3">
              {rateSuggestionLabel}
            </AppText>
          )}
        </>
      )}
    />
  );

  return (
    <View className="flex flex-1">
      <View className="p-4 pb-3 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
        <AppText variant="titleMedium" className="mb-2">
          {t("Transaction Type")}
        </AppText>
        <Controller
          control={control}
          name="transactionType"
          render={({ field: { value, onChange } }) => (
            <SegmentedButtons
              value={value}
              onValueChange={(selectedType) => {
                onChange(selectedType);
                setValue("categoryId", "");
                if (selectedType === TXN_TYPE_ENUM.TRANSFER) {
                  setValue("accountId", "");
                } else {
                  setValue("fromAccountId", "");
                  setValue("toAccountId", "");
                }
                setValue("currencyCode", "");
                setValue("accountCurrencyCode", "");
                setValue("convertedAmount", "0");
                setValue("exchangeRate", EXCHANGE_RATE_ZERO);
                setValue("exchangeRateSource", undefined);
                setValue("exchangeRateSourceTransactionId", "");
                clearErrors();
              }}
              buttons={[
                {
                  value: TXN_TYPE_ENUM.EXPENSE,
                  label: t("Expense"),
                  icon: "arrow-up",
                },
                {
                  value: TXN_TYPE_ENUM.INCOME,
                  label: t("Income"),
                  icon: "arrow-down",
                },
                {
                  value: TXN_TYPE_ENUM.TRANSFER,
                  label: t("Transfer"),
                  icon: "swap-horizontal",
                },
              ]}
            />
          )}
        />
      </View>

      <AppScrollView
        className="p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer border-0 flex-1"
        contentContainerStyle={{ justifyContent: "flex-start" }}
      >
        <CategoryIdField
          control={control}
          transactionType={transactionType}
          categoryItems={categoryItems}
          error={categoryError}
          isLoading={isLoadingCategories}
          onManageCategories={onManageCategories}
        />

        {transactionType === TXN_TYPE_ENUM.TRANSFER ? (
          <>
            {renderTransactionDate()}
            <View className="flex-row items-center">
              <AccountIdField
                {...accountFieldProps}
                fieldName="fromAccountId"
                label="From Account"
                isPickerVisible={
                  isAccountPickerVisible &&
                  activeAccountField === "fromAccountId"
                }
                onOpenPicker={() => openAccountPicker("fromAccountId")}
                onSelectedAccountChange={(account) =>
                  logic.onAccountChange("fromAccountId", account)
                }
              />
              <View
                className="px-2 pb-2 items-center justify-center"
                style={{ height: TEXTINPUT_HEIGHT }}
              >
                <AppIcon name="MoveRight" size={24} />
              </View>
              <AccountIdField
                {...accountFieldProps}
                fieldName="toAccountId"
                label="To Account"
                isPickerVisible={
                  isAccountPickerVisible && activeAccountField === "toAccountId"
                }
                onOpenPicker={() => openAccountPicker("toAccountId")}
                onSelectedAccountChange={(account) =>
                  logic.onAccountChange("toAccountId", account)
                }
                showQueryError={false}
              />
            </View>
            <View className={usesExchangeRate ? "flex-row gap-2" : undefined}>
              <View className="flex-1">{renderOriginalAmount()}</View>
              {usesExchangeRate && (
                <View className="flex-1">{renderAccountAmount()}</View>
              )}
            </View>
          </>
        ) : (
          <>
            <View className="flex-row gap-2">
              <View className="flex-1">{renderTransactionDate()}</View>
              <AccountIdField
                {...accountFieldProps}
                fieldName="accountId"
                label="Account"
                isPickerVisible={
                  isAccountPickerVisible && activeAccountField === "accountId"
                }
                onOpenPicker={() => openAccountPicker("accountId")}
                onSelectedAccountChange={(account) =>
                  logic.onAccountChange("accountId", account)
                }
              />
            </View>
            <View className="flex-row gap-2">
              {showCurrencyField && (
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="currencyCode"
                    render={({ field, fieldState: { error } }) => (
                      <AppSelect
                        label="Currency"
                        value={field.value}
                        options={currencyOptions}
                        onChange={(value) =>
                          logic.onCurrencyChange(value?.toString() ?? "")
                        }
                        onBlur={field.onBlur}
                        errorField={error}
                        showClear={false}
                      />
                    )}
                  />
                </View>
              )}
              <View className="flex-1">{renderOriginalAmount()}</View>
            </View>
          </>
        )}

        {usesExchangeRate && (
          <View
            className={
              transactionType === TXN_TYPE_ENUM.TRANSFER
                ? undefined
                : "flex-row gap-2"
            }
          >
            <View
              className={
                transactionType === TXN_TYPE_ENUM.TRANSFER
                  ? undefined
                  : "flex-1"
              }
            >
              {renderExchangeRate()}
            </View>
            {transactionType !== TXN_TYPE_ENUM.TRANSFER && (
              <View className="flex-1">{renderAccountAmount()}</View>
            )}
          </View>
        )}

        <Controller
          control={control}
          name="description"
          render={({
            field: { value, onChange, onBlur, ref },
            fieldState: { error },
          }) => (
            <AppTextInput
              ref={ref}
              mode="outlined"
              label="Description"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={DESCRIPTION_MAX_LEN}
              numberOfLines={3}
              multiline
              showClear
              errorField={error}
            />
          )}
        />

        <View className="mt-2">
          <TransactionFeeFields
            categoryOptions={feeCategoryOptions}
            control={control}
            currencyCode={
              transactionType === TXN_TYPE_ENUM.TRANSFER
                ? currencyCode
                : accountCurrencyCode
            }
            fields={feeFields}
            onAdd={logic.addFee}
            onRemove={logic.removeFee}
            onManageCategories={onManageCategories}
          />
        </View>

        {responseError && (
          <AppText type={TextTypEnum.ERROR}>{responseError}</AppText>
        )}

        {footer}
      </AppScrollView>
    </View>
  );
}

export default function TransactionManagementCreate() {
  const logic = useTransactionManagementCreate();
  return (
    <TransactionFormScreen
      logic={logic}
      footer={
        <View className="flex-row items-center justify-center gap-4 mt-2 mb-4">
          <AppButton
            disabled={logic.isSubmitting}
            loading={logic.isSaving}
            variant={ButtonType.SECONDARY}
            onPress={logic.handleSubmit((value) =>
              logic.onSubmit(value, false),
            )}
            style={{ flex: 0.4, borderRadius: 4 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save
          </AppButton>
          <AppButton
            disabled={logic.isSubmitting}
            loading={logic.isSavingAndNew}
            onPress={logic.handleSubmit((value) => logic.onSubmit(value, true))}
            style={{ flex: 1, borderRadius: 4 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save & New
          </AppButton>
        </View>
      }
    />
  );
}
