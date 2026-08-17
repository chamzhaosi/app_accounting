import type {
  Control,
  UseFormHandleSubmit,
  UseFormSetFocus,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { View } from "react-native";
import type { AppIconProps } from "../../../components/AppIcon";
import AppIconSelect from "../../../components/AppIconSelect";
import AppSelect from "../../../components/AppSelect";
import AppTextInput from "../../../components/AppTextInput";
import { ICONS } from "../../../constants/icons";
import { CATEGORY_TRANSACTION_TYPE_OPTIONS } from "../../../constants/options";
import {
  DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN,
} from "../../../forms/schemas/category_management.schema";
import type { CategoryManagementFormType } from "../../../forms/schemas/category_management.schema";

type Props = {
  control: Control<CategoryManagementFormType>;
  handleSubmit: UseFormHandleSubmit<CategoryManagementFormType>;
  isSubmitting: boolean;
  onSubmit: (value: CategoryManagementFormType) => void | Promise<void>;
  setFocus: UseFormSetFocus<CategoryManagementFormType>;
};

export default function CategoryManagementFormFields({
  control,
  handleSubmit,
  isSubmitting,
  onSubmit,
  setFocus,
}: Props) {
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
            label="Transaction Type"
            value={value?.toString() ?? ""}
            onChange={(selected) => onChange(Number(selected ?? 0))}
            onBlur={onBlur}
            options={CATEGORY_TRANSACTION_TYPE_OPTIONS}
            errorField={error}
            editable={!isSubmitting}
            disabled={isSubmitting}
            showClear
          />
        )}
      />
      <View className="flex-row justify-around mb-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer gap-4">
        <View className="flex-[0.2] h-[80]">
          <Controller
            control={control}
            name="icon"
            render={({
              field: { value, onChange, onBlur, ref },
              fieldState: { error },
            }) => (
              <AppIconSelect
                ref={ref}
                value={value as AppIconProps["name"]}
                onChange={onChange}
                error={error}
                onBlur={onBlur}
                icons={ICONS.CATEGORY_ICONS}
                editable={!isSubmitting}
                disabled={isSubmitting}
              />
            )}
          />
        </View>
        <View className="flex-[0.8]">
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
                editable={!isSubmitting}
                disabled={isSubmitting}
                onChangeText={onChange}
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
        </View>
      </View>
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
            editable={!isSubmitting}
            disabled={isSubmitting}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            maxLength={DESCRIPTION_MAX_LEN}
            showClear
            errorField={error}
            submitBehavior="submit"
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        )}
      />
    </>
  );
}
