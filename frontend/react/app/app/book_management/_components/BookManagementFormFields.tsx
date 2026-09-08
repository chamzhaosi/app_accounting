import { Controller, type Control } from "react-hook-form";
import { View } from "react-native";
import AppIconSelect from "../../../components/AppIconSelect";
import AppTextInput from "../../../components/AppTextInput";
import { ICONS } from "../../../constants/icons";
import {
  DESCRIPTION_MAX_LEN,
  LABEL_MAX_LEN,
  type BookManagementFormType,
} from "../../../forms/schemas/book_management.schema";

export default function BookManagementFormFields({
  control,
  disabled,
}: {
  control: Control<BookManagementFormType>;
  disabled: boolean;
}) {
  return (
    <>
      <View style={{ display: "flex", flexDirection: "row", marginBottom: 8 }}>
        <View style={{ height: 76, width: 76, marginTop: -7 }}>
          <Controller
            control={control}
            name="icon"
            render={({
              field: { value, onChange, onBlur, ref },
              fieldState: { error },
            }) => (
              <AppIconSelect
                ref={ref}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={error}
                icons={ICONS.BOOK}
                editable={!disabled}
                disabled={disabled}
              />
            )}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Controller
            control={control}
            name="label"
            render={({
              field: { value, onChange, onBlur, ref },
              fieldState: { error },
            }) => (
              <AppTextInput
                ref={ref}
                label="Label"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!disabled}
                errorField={error}
                maxLength={LABEL_MAX_LEN}
                showClear
              />
            )}
          />
        </View>
      </View>
      <Controller
        control={control}
        name="description"
        render={({
          field: { value, onChange, onBlur, ref },
          fieldState: { error },
        }) => (
          <AppTextInput
            ref={ref}
            label="Description"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            editable={!disabled}
            errorField={error}
            maxLength={DESCRIPTION_MAX_LEN}
            multiline
            numberOfLines={4}
            showClear
          />
        )}
      />
    </>
  );
}
