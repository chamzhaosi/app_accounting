import type { Control, UseFormSetFocus } from "react-hook-form";
import { Controller } from "react-hook-form";
import AppAmtInput from "../../../components/AppAmtInput";
import AppSelect from "../../../components/AppSelect";
import type { SelectOptionType } from "../../../components/AppSelect";
import AppSwitch from "../../../components/AppSwitch";
import AppTextInput from "../../../components/AppTextInput";
import {
  CURRENT_BALANCE_MAX_LEN,
  DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN,
} from "../../../forms/schemas/account_management.schema";
import type { AccountManagementFormType } from "../../../forms/schemas/account_management.schema";

type AccountManagementFormFieldsProps = {
  accountTypeOptions: SelectOptionType[];
  currencyOptions: SelectOptionType[];
  control: Control<AccountManagementFormType>;
  isSubmitting: boolean;
  setFocus: UseFormSetFocus<AccountManagementFormType>;
  showCurrencyField: boolean;
};

export default function AccountManagementFormFields({
  accountTypeOptions,
  currencyOptions,
  control,
  isSubmitting,
  setFocus,
  showCurrencyField,
}: AccountManagementFormFieldsProps) {
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
              onChange={(currencyCode) => onChange(String(currencyCode ?? ""))}
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
            maxLength={CURRENT_BALANCE_MAX_LEN}
            showClear
            fixedDecimalInput
            errorField={error}
          />
        )}
      />
      <Controller
        control={control}
        name="isMainAccount"
        render={({ field: { value, onChange, ref } }) => (
          <AppSwitch
            ref={ref}
            label="Main Account"
            disabled={isSubmitting}
            value={value}
            onValueChange={onChange}
          />
        )}
      />
    </>
  );
}
