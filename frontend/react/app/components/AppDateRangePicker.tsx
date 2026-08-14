import { forwardRef, useState } from "react";
import { FieldError } from "react-hook-form";
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from "react-native";
import { TextInput, TextInputProps, useTheme } from "react-native-paper";
import AppTextInput from "./AppTextInput";
import CustomDateRangePicker, {
  AppDateRangeValue,
} from "./CustomDateRangePicker";

export type { AppDateRangeValue } from "./CustomDateRangePicker";

type AppDateRangePickerProps = Omit<
  TextInputProps,
  "value" | "onChange" | "onChangeText" | "editable" | "onBlur"
> & {
  value?: AppDateRangeValue;
  onChange: (range: AppDateRangeValue) => void;
  onBlur?: () => void;
  errorField?: FieldError;
  disableFutureDates?: boolean;
  maxRangeDays?: number;
};

const formatDate = (date?: Date) => {
  if (!date || Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatRange = (range?: AppDateRangeValue) => {
  const startDate = formatDate(range?.startDate);
  const endDate = formatDate(range?.endDate);

  if (!startDate) return "";
  return endDate ? `${startDate} - ${endDate}` : startDate;
};

const AppDateRangePicker = forwardRef<RNTextInput, AppDateRangePickerProps>(
  (
    {
      value,
      onChange,
      errorField,
      onBlur,
      disabled,
      disableFutureDates = false,
      maxRangeDays,
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const [draftValue, setDraftValue] = useState<AppDateRangeValue | undefined>(
      value,
    );
    const theme = useTheme();

    const openPicker = () => {
      if (disabled) return;

      setDraftValue(value);
      setVisible(true);
    };

    const dismissPicker = () => {
      setVisible(false);
      onBlur?.();
    };

    return (
      <>
        <Pressable disabled={disabled} onPress={openPicker}>
          <AppTextInput
            {...props}
            ref={ref}
            style={{ marginBottom: 16 }}
            value={formatRange(value)}
            editable={false}
            disabled={disabled}
            showSoftInputOnFocus={false}
            errorField={errorField}
            onBlur={dismissPicker}
            pointerEvents="none"
            right={
              <TextInput.Icon
                icon="calendar-range"
                disabled={disabled}
                forceTextInputFocus={false}
                onPress={openPicker}
              />
            }
          />
        </Pressable>

        <Modal
          animationType="fade"
          transparent
          visible={visible}
          statusBarTranslucent
          onRequestClose={dismissPicker}
        >
          <View style={styles.modalRoot}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss date range picker"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: theme.colors.backdrop },
              ]}
              onPress={dismissPicker}
            />

            <View style={styles.dialog}>
              <CustomDateRangePicker
                value={draftValue}
                disableFutureDates={disableFutureDates}
                maxRangeDays={maxRangeDays}
                onChange={(range) => {
                  setDraftValue(range);

                  if (range.startDate && range.endDate) {
                    onChange(range);
                    dismissPicker();
                  }
                }}
              />
            </View>
          </View>
        </Modal>
      </>
    );
  },
);

const styles = StyleSheet.create({
  modalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  dialog: {
    borderRadius: 16,
    elevation: 8,
    maxWidth: 400,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    width: "100%",
  },
});

AppDateRangePicker.displayName = "AppDateRangePicker";

export default AppDateRangePicker;
