import { forwardRef, useState } from "react";
import { FieldError } from "react-hook-form";
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from "react-native";
import {
  IconButton,
  TextInput,
  TextInputProps,
  useTheme,
} from "react-native-paper";
import AppTextInput from "./AppTextInput";
import CustomDateRangePicker, {
  AppDateRangeValue,
} from "./CustomDateRangePicker";
import { formatDateValue } from "../utils/date";
import { useTranslation } from "../i18n";

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

const formatRange = (range?: AppDateRangeValue) => {
  const startDate = formatDateValue(range?.startDate);
  const endDate = formatDateValue(range?.endDate);

  if (!startDate) return "";
  return endDate ? `${startDate} - ${endDate}` : startDate;
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getAdjacentMonthRange = (
  value: AppDateRangeValue | undefined,
  monthOffset: number,
  disableFutureDates: boolean,
  maxRangeDays?: number,
): AppDateRangeValue | undefined => {
  const referenceDate = value?.startDate ?? new Date();
  const startDate = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + monthOffset,
    1,
  );
  const today = startOfDay(new Date());

  if (disableFutureDates && startDate > today) return undefined;

  let endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

  if (disableFutureDates && endDate > today) endDate = today;

  if (
    maxRangeDays !== undefined &&
    Number.isFinite(maxRangeDays) &&
    maxRangeDays >= 1
  ) {
    const maximumEndDate = new Date(startDate);
    maximumEndDate.setDate(
      maximumEndDate.getDate() + Math.floor(maxRangeDays) - 1,
    );
    if (endDate > maximumEndDate) endDate = maximumEndDate;
  }

  return { startDate, endDate };
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
    const { locale, t } = useTranslation();

    const openPicker = () => {
      if (disabled) return;

      setDraftValue(value);
      setVisible(true);
    };

    const dismissPicker = () => {
      setVisible(false);
      onBlur?.();
    };

    const navigateMonth = (monthOffset: number) => {
      if (disabled) return;

      const nextValue = getAdjacentMonthRange(
        value,
        monthOffset,
        disableFutureDates,
        maxRangeDays,
      );
      if (nextValue) onChange(nextValue);
    };

    const nextMonthRange = getAdjacentMonthRange(
      value,
      1,
      disableFutureDates,
      maxRangeDays,
    );

    return (
      <>
        <View style={styles.quickNavigationRow}>
          <IconButton
            icon="chevron-left"
            size={20}
            hitSlop={6}
            style={styles.quickNavigationButton}
            accessibilityLabel={t("Previous month")}
            disabled={disabled}
            onPress={() => navigateMonth(-1)}
          />

          <View style={styles.inputContainer}>
            <Pressable disabled={disabled} onPress={openPicker}>
              <AppTextInput
                {...props}
                ref={ref}
                style={props.style}
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
          </View>

          <IconButton
            icon="chevron-right"
            size={20}
            hitSlop={6}
            style={styles.quickNavigationButton}
            accessibilityLabel={t("Next month")}
            disabled={disabled || !nextMonthRange}
            onPress={() => navigateMonth(1)}
          />
        </View>

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
              accessibilityLabel={t("Dismiss date range picker")}
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: theme.colors.backdrop },
              ]}
              onPress={dismissPicker}
            />

            <View style={styles.dialog}>
              <CustomDateRangePicker
                value={draftValue}
                locale={locale}
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
  quickNavigationRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  quickNavigationButton: {
    height: 40,
    margin: 0,
    width: 32,
  },
  inputContainer: {
    flex: 1,
  },
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
