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
import { formatDateValue } from "../utils/date";
import AppTextInput from "./AppTextInput";
import CustomDatePicker from "./CustomDatePicker";
import { useTranslation } from "../i18n/helper";

type AppDatePickerProps = Omit<
  TextInputProps,
  "value" | "onChange" | "onChangeText" | "editable" | "onBlur"
> & {
  value?: Date;
  onChange: (date: Date) => void;
  onBlur?: () => void;
  errorField?: FieldError;
};

const AppDatePicker = forwardRef<RNTextInput, AppDatePickerProps>(
  ({ value, onChange, errorField, onBlur, disabled, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const theme = useTheme();
    const { locale, t } = useTranslation();

    const openPicker = () => {
      if (!disabled) setVisible(true);
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
            value={formatDateValue(value)}
            editable={false}
            disabled={disabled}
            showSoftInputOnFocus={false}
            errorField={errorField}
            onBlur={dismissPicker}
            pointerEvents="none"
            right={
              <TextInput.Icon
                icon="calendar"
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
              accessibilityLabel={t("Dismiss date picker")}
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: theme.colors.backdrop },
              ]}
              onPress={dismissPicker}
            />

            <View style={styles.dialog}>
              <CustomDatePicker
                value={value}
                locale={locale}
                onChange={(date) => {
                  onChange(date);
                  dismissPicker();
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  dialog: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
});

AppDatePicker.displayName = "AppDatePicker";

export default AppDatePicker;
