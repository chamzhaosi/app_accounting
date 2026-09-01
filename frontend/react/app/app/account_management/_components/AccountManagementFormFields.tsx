import type {
  Control,
  UseFormSetFocus,
  UseFormSetValue,
} from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";
import AppAmtInput from "../../../components/AppAmtInput";
import AppSelect from "../../../components/AppSelect";
import type { SelectOptionType } from "../../../components/AppSelect";
import AppSwitch from "../../../components/AppSwitch";
import AppTextInput from "../../../components/AppTextInput";
import {
  DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN,
} from "../../../forms/schemas/account_management.schema";
import type { AccountManagementFormType } from "../../../forms/schemas/account_management.schema";
import { getCurrencyDecimalDigits } from "../../../constants/currencies";
import { getAmountMaxLength, toAmountString } from "../../../utils/amount";

type AccountManagementFormFieldsProps = {
  accountTypeOptions: SelectOptionType[];
  currencyOptions: SelectOptionType[];
  control: Control<AccountManagementFormType>;
  isSubmitting: boolean;
  setFocus: UseFormSetFocus<AccountManagementFormType>;
  setValue: UseFormSetValue<AccountManagementFormType>;
  showCurrencyField: boolean;
};

export default function AccountManagementFormFields({
  accountTypeOptions,
  currencyOptions,
  control,
  isSubmitting,
  setFocus,
  setValue,
  showCurrencyField,
}: AccountManagementFormFieldsProps) {
  const currencyCode = useWatch({ control, name: "currencyCode" });
  const currentBalance = useWatch({ control, name: "currentBalance" });
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
            onChange={onChange}
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
                onChange(code);
                setValue(
                  "currentBalance",
                  toAmountString(currentBalance, code),
                  { shouldValidate: true },
                );
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
            onChangeText={onChange}
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
