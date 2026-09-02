import dayjs from "dayjs";
import type { ReactNode } from "react";
import { Controller } from "react-hook-form";
import { Pressable, ScrollView, View } from "react-native";
import { SegmentedButtons, Text, TextInput } from "react-native-paper";
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
import { useThemeStore } from "../../stores/useThemeStore";
import { EXCHANGE_RATE_ZERO } from "../../utils/exchangeRate";
import AccountIdField from "./_components/AccountIdField";
import CategoryIdField from "./_components/CategoryIdField";
import TransactionFeeFields from "./_components/TransactionFeeFields";
import AppDialog from "../../components/AppDialog";
import { DIALOG_COMMON_BTN_PROPS } from "../../constants/size";

type TransactionFormScreenLogic = Omit<
  ReturnType<typeof useTransactionManagementCreate>,
  | "isSaving"
  | "isSavingAndNew"
  | "onSubmit"
  | "showMinimumPaymentDialog"
  | "setShowMinimumPaymentDialog"
  | "finishMinimumPaymentPrompt"
  | "cancelMinimumPaymentPrompt"
  | "recentDescriptions"
> & {
  recentDescriptions?: string[];
};

type TransactionFormScreenProps = {
  footer: ReactNode;
  logic: TransactionFormScreenLogic;
  lockTransactionType?: boolean;
};

export function TransactionFormScreen({
  footer,
  logic,
  lockTransactionType = false,
}: TransactionFormScreenProps) {
  const { t } = useTranslation();
  const { THEME } = useThemeStore();
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
    isSubmitting,
    isSubmitted,
    onManageCategories,
    openAccountPicker,
    rateSuggestionLabel,
    recentDescriptions = [],
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
          disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            right={
              <TextInput.Icon
                icon="history"
                disabled={isSubmitting || isLoadingRateSuggestion}
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
                if (lockTransactionType || isSubmitting) return;

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
                  disabled:
                    isSubmitting ||
                    (lockTransactionType && value !== TXN_TYPE_ENUM.EXPENSE),
                  style:
                    lockTransactionType && value !== TXN_TYPE_ENUM.EXPENSE
                      ? { backgroundColor: THEME.surfaceDisabled }
                      : undefined,
                },
                {
                  value: TXN_TYPE_ENUM.INCOME,
                  label: t("Income"),
                  icon: "arrow-down",
                  disabled:
                    isSubmitting ||
                    (lockTransactionType && value !== TXN_TYPE_ENUM.INCOME),
                  style:
                    lockTransactionType && value !== TXN_TYPE_ENUM.INCOME
                      ? { backgroundColor: THEME.surfaceDisabled }
                      : undefined,
                },
                {
                  value: TXN_TYPE_ENUM.TRANSFER,
                  label: t("Transfer"),
                  icon: "swap-horizontal",
                  disabled:
                    isSubmitting ||
                    (lockTransactionType && value !== TXN_TYPE_ENUM.TRANSFER),
                  style:
                    lockTransactionType && value !== TXN_TYPE_ENUM.TRANSFER
                      ? { backgroundColor: THEME.surfaceDisabled }
                      : undefined,
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
          disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
            <>
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
                showCounter={recentDescriptions.length === 0}
                errorField={error}
                disabled={isSubmitting}
                outlineStyle={
                  recentDescriptions.length > 0
                    ? {
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                      }
                    : undefined
                }
              />
              {recentDescriptions.length > 0 && (
                <View
                  style={{
                    marginTop: -1,
                    marginBottom: 10,
                    paddingTop: 6,
                    paddingBottom: 8,
                    borderWidth: 1,
                    borderTopWidth: 0,
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4,
                    borderColor: THEME.outline,
                    backgroundColor: THEME.surfaceContainerHigh,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingHorizontal: 10,
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      variant="labelSmall"
                      style={{ color: THEME.onSurfaceVariant }}
                    >
                      {t("Frequently used")}
                    </Text>
                    <Text
                      variant="labelSmall"
                      style={{ color: THEME.onSurfaceVariant }}
                    >
                      {value?.length ?? 0}/{DESCRIPTION_MAX_LEN}
                    </Text>
                  </View>
                  <ScrollView
                    style={{ display: "flex", flexGrow: 0 }}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      gap: 8,
                      paddingLeft: 8,
                      paddingRight: 16,
                    }}
                  >
                    {recentDescriptions.map((description) => {
                      const isSelected = value === description;

                      return (
                        <Pressable
                          key={description}
                          accessibilityRole="button"
                          accessibilityState={{
                            disabled: isSubmitting,
                            selected: isSelected,
                          }}
                          disabled={isSubmitting}
                          style={{
                            height: 34,
                            maxWidth: 200,
                            justifyContent: "center",
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            backgroundColor: isSelected
                              ? THEME.primaryContainer
                              : THEME.surfaceContainerHighest,
                            opacity: isSubmitting ? 0.6 : 1,
                          }}
                          onPress={() => onChange(description)}
                        >
                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={{
                              color: isSelected
                                ? THEME.onPrimaryContainer
                                : THEME.onSurface,
                            }}
                          >
                            {description}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </>
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
            disabled={isSubmitting}
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
    <>
      <AppDialog
        title="Minimum payment"
        description="Does this payment satisfy the minimum payment required for this credit-card statement?"
        showDialog={logic.showMinimumPaymentDialog}
        onDismiss={logic.cancelMinimumPaymentPrompt}
        actionRender={
          <>
            <AppButton
              {...DIALOG_COMMON_BTN_PROPS}
              variant={ButtonType.SECONDARY}
              onPress={logic.cancelMinimumPaymentPrompt}
            >
              Cancel
            </AppButton>
            <AppButton
              {...DIALOG_COMMON_BTN_PROPS}
              variant={ButtonType.SECONDARY}
              onPress={() => void logic.finishMinimumPaymentPrompt(false)}
            >
              No
            </AppButton>
            <AppButton
              {...DIALOG_COMMON_BTN_PROPS}
              onPress={() => void logic.finishMinimumPaymentPrompt(true)}
            >
              Yes
            </AppButton>
          </>
        }
      />
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
              onPress={logic.handleSubmit((value) =>
                logic.onSubmit(value, true),
              )}
              style={{ flex: 1, borderRadius: 4 }}
              {...SUBMIT_BTN_CONTENT_STYLE}
            >
              Save & New
            </AppButton>
          </View>
        }
      />
    </>
  );
}
