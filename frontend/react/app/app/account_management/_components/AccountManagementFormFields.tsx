import type {
  Control,
  UseFormSetFocus,
  UseFormSetValue,
} from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import AppText from "../../../components/AppText";
import AppAmtInput from "../../../components/AppAmtInput";
import AppSelect from "../../../components/AppSelect";
import type { SelectOptionType } from "../../../components/AppSelect";
import AppSwitch from "../../../components/AppSwitch";
import AppTextInput from "../../../components/AppTextInput";
import AppTimePicker from "../../../components/AppTimePicker";
import {
  DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN,
} from "../../../forms/schemas/account_management.schema";
import type { AccountManagementFormType } from "../../../forms/schemas/account_management.schema";
import { getCurrencyDecimalDigits } from "../../../constants/currencies";
import { getAmountMaxLength, toAmountString } from "../../../utils/amount";
import { getCurrentCreditCardCycleDates } from "../../../utils/creditCardCycle";

type AccountManagementFormFieldsProps = {
  accountTypeOptions: SelectOptionType[];
  creditCardTypeId: string;
  currencyOptions: SelectOptionType[];
  control: Control<AccountManagementFormType>;
  isSubmitting: boolean;
  setFocus: UseFormSetFocus<AccountManagementFormType>;
  setValue: UseFormSetValue<AccountManagementFormType>;
  showCurrencyField: boolean;
};

export default function AccountManagementFormFields({
  accountTypeOptions,
  creditCardTypeId,
  currencyOptions,
  control,
  isSubmitting,
  setFocus,
  setValue,
  showCurrencyField,
}: AccountManagementFormFieldsProps) {
  const { fontScale, width } = useWindowDimensions();
  const currencyCode = useWatch({ control, name: "currencyCode" });
  const currentBalance = useWatch({ control, name: "currentBalance" });
  const typeId = useWatch({ control, name: "typeId" });
  const reminderEnabled = useWatch({ control, name: "reminderEnabled" });
  const firstCycleMode = useWatch({ control, name: "firstCycleMode" });
  const balancePosition = useWatch({ control, name: "balancePosition" });
  const statementDay = useWatch({ control, name: "statementDay" });
  const dueDay = useWatch({ control, name: "dueDay" });
  const isCreditCard = Boolean(creditCardTypeId && typeId === creditCardTypeId);
  const calculatedCurrentDueDate = useMemo(
    () =>
      getCurrentCreditCardCycleDates(Number(statementDay), Number(dueDay))
        ?.dueDate ?? "",
    [dueDay, statementDay],
  );

  useEffect(() => {
    if (
      !isCreditCard ||
      !reminderEnabled ||
      firstCycleMode !== "current" ||
      !calculatedCurrentDueDate
    )
      return;
    setValue("currentCycleDueDate", calculatedCurrentDueDate, {
      shouldValidate: true,
    });
  }, [
    calculatedCurrentDueDate,
    firstCycleMode,
    isCreditCard,
    reminderEnabled,
    setValue,
  ]);

  const populateCurrentCycleAmount = (
    amount: string | undefined,
    position = balancePosition,
  ) => {
    setValue(
      "currentCycleRemainingDue",
      position === "debt" ? amount || "0" : "0",
      { shouldValidate: true },
    );
  };
  const shouldStackPairedFields = width < 360 || fontScale > 1.2;
  const pairedFieldRowStyle = [
    styles.fieldRow,
    shouldStackPairedFields && styles.stackedFieldRow,
  ];
  const dayOptions = Array.from({ length: 31 }, (_, index) => ({
    id: String(index + 1),
    label: String(index + 1),
    value: String(index + 1),
  }));
  const leadDayOptions = dayOptions.slice(0, 10);
  return (
    <>
      <Controller
        control={control}
        name="typeId"
        render={({
          field: { value, onChange, onBlur, ref },
          fieldState: { error },
        }) => (
          <AppSelect
            ref={ref}
            label="Account Type"
            value={value?.toString() ?? ""}
            onChange={(nextTypeId) => {
              onChange(nextTypeId);
              if (String(nextTypeId ?? "") !== creditCardTypeId) {
                setValue("reminderEnabled", false, { shouldValidate: true });
              }
            }}
            onBlur={onBlur}
            options={accountTypeOptions}
            errorField={error}
            disabled={isSubmitting}
            showClear
          />
        )}
      />
      <Controller
        control={control}
        name="label"
        render={({
          field: { value, onChange, onBlur, ref },
          fieldState: { error },
        }) => (
          <AppTextInput
            ref={ref}
            mode="outlined"
            label="Label"
            disabled={isSubmitting}
            onChangeText={onChange}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            maxLength={LABEL_MAX_LEN}
            showClear
            errorField={error}
            submitBehavior="submit"
            onSubmitEditing={() => setFocus("descriptions")}
          />
        )}
      />
      <Controller
        control={control}
        name="descriptions"
        render={({
          field: { value, onChange, onBlur, ref },
          fieldState: { error },
        }) => (
          <AppTextInput
            ref={ref}
            mode="outlined"
            label="Descriptions"
            numberOfLines={3}
            multiline
            disabled={isSubmitting}
            onChangeText={onChange}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            maxLength={DESCRIPTION_MAX_LEN}
            showClear
            errorField={error}
            submitBehavior="submit"
            onSubmitEditing={() => setFocus("currentBalance")}
          />
        )}
      />
      {showCurrencyField && (
        <Controller
          control={control}
          name="currencyCode"
          render={({
            field: { value, onChange, onBlur, ref },
            fieldState: { error },
          }) => (
            <AppSelect
              ref={ref}
              label="Currency"
              value={value}
              onChange={(nextCurrencyCode) => {
                const code = String(nextCurrencyCode ?? "");
                const formattedBalance = toAmountString(currentBalance, code);
                onChange(code);
                setValue("currentBalance", formattedBalance, {
                  shouldValidate: true,
                });
                if (firstCycleMode === "current") {
                  populateCurrentCycleAmount(formattedBalance);
                }
              }}
              onBlur={onBlur}
              options={currencyOptions}
              errorField={error}
              disabled={isSubmitting}
              showClear={false}
            />
          )}
        />
      )}
      <Controller
        control={control}
        name="currentBalance"
        render={({
          field: { value, onChange, onBlur, ref },
          fieldState: { error },
        }) => (
          <AppAmtInput
            ref={ref}
            mode="outlined"
            label="Current Balance"
            disabled={isSubmitting}
            keyboardType="number-pad"
            onChangeText={(amount) => {
              onChange(amount);
              if (firstCycleMode === "current") {
                populateCurrentCycleAmount(amount);
              }
            }}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            maxLength={getAmountMaxLength(currencyCode)}
            showClear
            fixedDecimalInput
            fixedDecimalPlaces={getCurrencyDecimalDigits(currencyCode)}
            errorField={error}
          />
        )}
      />
      {isCreditCard && (
        <Controller
          control={control}
          name="balancePosition"
          render={({ field: { value, onChange } }) => (
            <>
              <AppText variant="titleMedium" className="mb-2">
                Balance position
              </AppText>
              <SegmentedButtons
                value={value}
                onValueChange={(position) => {
                  onChange(position);
                  if (firstCycleMode === "current") {
                    populateCurrentCycleAmount(currentBalance, position);
                  }
                }}
                buttons={[
                  { value: "debt", label: "Debt", disabled: isSubmitting },
                  {
                    value: "overpayment",
                    label: "Overpayment",
                    disabled: isSubmitting,
                  },
                ]}
                style={{ marginBottom: 16 }}
              />
            </>
          )}
        />
      )}
      {isCreditCard && (
        <Controller
          control={control}
          name="reminderEnabled"
          render={({ field: { value, onChange, ref } }) => (
            <AppSwitch
              ref={ref}
              label="Payment reminder"
              description="Remind me daily before this card payment is due."
              disabled={isSubmitting}
              value={value}
              onValueChange={onChange}
            />
          )}
        />
      )}
      {isCreditCard && reminderEnabled && (
        <>
          <View style={pairedFieldRowStyle}>
            <View style={styles.fieldColumn}>
              <Controller
                control={control}
                name="statementDay"
                render={({ field, fieldState: { error } }) => (
                  <AppSelect
                    label="Statement day"
                    value={field.value}
                    options={dayOptions}
                    onChange={(value) => field.onChange(String(value))}
                    errorField={error}
                    disabled={isSubmitting}
                    showClear={false}
                  />
                )}
              />
            </View>
            <View style={styles.fieldColumn}>
              <Controller
                control={control}
                name="dueDay"
                render={({ field, fieldState: { error } }) => (
                  <AppSelect
                    label="Due day"
                    value={field.value}
                    options={dayOptions}
                    onChange={(value) => field.onChange(String(value))}
                    errorField={error}
                    disabled={isSubmitting}
                    showClear={false}
                  />
                )}
              />
            </View>
          </View>
          <View style={pairedFieldRowStyle}>
            <View style={styles.fieldColumn}>
              <Controller
                control={control}
                name="reminderLeadDays"
                render={({ field, fieldState: { error } }) => (
                  <AppSelect
                    label="Days before"
                    accessibilityLabel="Start reminding days before due date"
                    value={field.value}
                    options={leadDayOptions}
                    onChange={(value) => field.onChange(String(value))}
                    errorField={error}
                    disabled={isSubmitting}
                    showClear={false}
                  />
                )}
              />
            </View>
            <View style={styles.fieldColumn}>
              <Controller
                control={control}
                name="reminderTime"
                render={({ field, fieldState: { error } }) => (
                  <AppTimePicker
                    mode="outlined"
                    label="Reminder time"
                    accessibilityLabel="Reminder time in 24-hour format"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    errorField={error}
                    disabled={isSubmitting}
                  />
                )}
              />
            </View>
          </View>
          <AppText variant="titleMedium" className="mb-2">
            Stop reminder when
          </AppText>
          <Controller
            control={control}
            name="reminderStopCondition"
            render={({ field }) => (
              <SegmentedButtons
                value={field.value}
                onValueChange={field.onChange}
                buttons={[
                  {
                    value: "full",
                    label: "Fully paid",
                    disabled: isSubmitting,
                  },
                  {
                    value: "minimum",
                    label: "Minimum confirmed",
                    disabled: isSubmitting,
                  },
                ]}
                style={{ marginBottom: 16 }}
              />
            )}
          />
          <AppText variant="titleMedium" className="mb-2">
            Start reminders from
          </AppText>
          <Controller
            control={control}
            name="firstCycleMode"
            render={({ field }) => (
              <SegmentedButtons
                value={field.value}
                onValueChange={(mode) => {
                  field.onChange(mode);
                  if (mode === "current") {
                    populateCurrentCycleAmount(currentBalance);
                  }
                }}
                buttons={[
                  {
                    value: "current",
                    label: "Current cycle",
                    disabled: isSubmitting,
                  },
                  {
                    value: "next",
                    label: "Next cycle",
                    disabled: isSubmitting,
                  },
                ]}
                style={{ marginBottom: 16 }}
              />
            )}
          />
          {firstCycleMode === "current" && (
            <View style={pairedFieldRowStyle}>
              <View style={styles.fieldColumn}>
                <Controller
                  control={control}
                  name="currentCycleDueDate"
                  render={({ field, fieldState: { error } }) => (
                    <AppTextInput
                      mode="outlined"
                      label="Due date"
                      accessibilityLabel="Current cycle due date"
                      value={field.value ?? calculatedCurrentDueDate}
                      editable={false}
                      onBlur={field.onBlur}
                      errorField={error}
                      disabled
                    />
                  )}
                />
              </View>
              <View style={styles.fieldColumn}>
                <Controller
                  control={control}
                  name="currentCycleRemainingDue"
                  render={({ field, fieldState: { error } }) => (
                    <AppAmtInput
                      mode="outlined"
                      label="Amount due"
                      accessibilityLabel="Remaining statement amount"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      keyboardType="number-pad"
                      fixedDecimalInput
                      fixedDecimalPlaces={getCurrencyDecimalDigits(
                        currencyCode,
                      )}
                      errorField={error}
                      disabled={isSubmitting}
                      continerClassName="mb-4"
                      showClear
                    />
                  )}
                />
              </View>
            </View>
          )}
        </>
      )}
      <Controller
        control={control}
        name="isActive"
        render={({ field: { value, onChange, ref } }) => (
          <AppSwitch
            ref={ref}
            label="Active account"
            description="Can be selected when recording new transactions."
            disabled={isSubmitting}
            value={value}
            onValueChange={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="isAsset"
        render={({ field: { value, onChange, ref } }) => (
          <AppSwitch
            ref={ref}
            label="Include in total balance"
            description="Include this account when calculating balances and assets."
            disabled={isSubmitting}
            value={value}
            onValueChange={onChange}
          />
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fieldColumn: {
    flex: 1,
    minWidth: 0,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 12,
  },
  stackedFieldRow: {
    flexDirection: "column",
    gap: 0,
  },
});
