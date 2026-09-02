import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { FieldError } from "react-hook-form";
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from "react-native";
import {
  Button,
  IconButton,
  Surface,
  Text,
  TextInput,
  TextInputProps,
  useTheme,
} from "react-native-paper";
import { useTranslation } from "../i18n/helper";
import AppTextInput from "./AppTextInput";

const HOLD_DELAY_MS = 600;
const REPEAT_INTERVAL_MS = 100;

type AppTimePickerProps = Omit<
  TextInputProps,
  "value" | "onChange" | "onChangeText" | "editable" | "onBlur"
> & {
  value?: string;
  onChange: (time: string) => void;
  onBlur?: () => void;
  errorField?: FieldError;
  withBottomSpacing?: boolean;
};

const formatPart = (value: number) => String(value).padStart(2, "0");

const parseTime = (value?: string) => {
  const match = value?.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (match) return { hour: Number(match[1]), minute: Number(match[2]) };

  const now = new Date();
  return { hour: now.getHours(), minute: now.getMinutes() };
};

const AppTimePicker = forwardRef<RNTextInput, AppTimePickerProps>(
  (
    {
      value,
      onChange,
      onBlur,
      errorField,
      disabled,
      style,
      withBottomSpacing = true,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);

    const openPicker = () => {
      if (disabled) return;
      const parsed = parseTime(value);
      setHour(parsed.hour);
      setMinute(parsed.minute);
      setVisible(true);
    };

    const dismissPicker = () => {
      setVisible(false);
      onBlur?.();
    };

    const confirmTime = () => {
      onChange(`${formatPart(hour)}:${formatPart(minute)}`);
      dismissPicker();
    };

    return (
      <>
        <Pressable disabled={disabled} onPress={openPicker}>
          <AppTextInput
            {...props}
            ref={ref}
            style={[style, { marginBottom: withBottomSpacing ? 16 : 0 }]}
            value={value ?? ""}
            editable={false}
            disabled={disabled}
            showSoftInputOnFocus={false}
            errorField={errorField}
            pointerEvents="none"
            right={
              <TextInput.Icon
                icon="clock-outline"
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
              accessibilityLabel={t("Dismiss time picker")}
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: theme.colors.backdrop },
              ]}
              onPress={dismissPicker}
            />

            <Surface
              elevation={5}
              style={[
                styles.dialog,
                { backgroundColor: theme.colors.secondaryContainer },
              ]}
            >
              <View style={styles.titleRow}>
                <Text variant="titleLarge">{t("Select time")}</Text>
                <View
                  style={[
                    styles.formatBadge,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.outlineVariant,
                    },
                  ]}
                >
                  <Text
                    variant="labelMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {t("24-hour format")}
                  </Text>
                </View>
              </View>

              <View style={styles.timeRow}>
                <TimePartSelector
                  label={t("Hour")}
                  value={hour}
                  maximum={23}
                  onChange={setHour}
                />
                <Text variant="displaySmall" style={styles.separator}>
                  :
                </Text>
                <TimePartSelector
                  label={t("Minute")}
                  value={minute}
                  maximum={59}
                  onChange={setMinute}
                />
              </View>

              <View style={styles.actions}>
                <Button mode="text" onPress={dismissPicker}>
                  {t("Cancel")}
                </Button>
                <Button mode="contained" onPress={confirmTime}>
                  {t("Confirm")}
                </Button>
              </View>
            </Surface>
          </View>
        </Modal>
      </>
    );
  },
);

type TimePartSelectorProps = {
  label: string;
  maximum: number;
  onChange: (value: number) => void;
  value: number;
};

function TimePartSelector({
  label,
  maximum,
  onChange,
  value,
}: TimePartSelectorProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const currentValueRef = useRef(value);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const repeatIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );
  const didRepeatRef = useRef(false);
  currentValueRef.current = value;

  const changeValue = useCallback(
    (amount: number) => {
      const nextValue =
        (currentValueRef.current + amount + maximum + 1) % (maximum + 1);
      currentValueRef.current = nextValue;
      onChange(nextValue);
    },
    [maximum, onChange],
  );

  const stopRepeating = useCallback(() => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (repeatIntervalRef.current) clearInterval(repeatIntervalRef.current);
    holdTimeoutRef.current = undefined;
    repeatIntervalRef.current = undefined;
  }, []);

  useEffect(() => stopRepeating, [stopRepeating]);

  const startRepeating = (amount: number) => {
    stopRepeating();
    didRepeatRef.current = false;
    holdTimeoutRef.current = setTimeout(() => {
      didRepeatRef.current = true;
      changeValue(amount);
      repeatIntervalRef.current = setInterval(
        () => changeValue(amount),
        REPEAT_INTERVAL_MS,
      );
    }, HOLD_DELAY_MS);
  };

  const handlePress = (amount: number) => {
    if (!didRepeatRef.current) changeValue(amount);
    didRepeatRef.current = false;
  };

  return (
    <View style={styles.timePart}>
      <Text
        variant="labelLarge"
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        {label}
      </Text>
      <IconButton
        icon="chevron-up"
        accessibilityLabel={t("Increase {{part}}", { part: label })}
        onPressIn={() => startRepeating(1)}
        onPressOut={stopRepeating}
        onPress={() => handlePress(1)}
      />
      <View
        style={[
          styles.timeValue,
          {
            backgroundColor: theme.colors.primaryContainer,
            borderColor: theme.colors.primary,
          },
        ]}
      >
        <Text
          variant="displaySmall"
          style={{ color: theme.colors.onPrimaryContainer }}
        >
          {formatPart(value)}
        </Text>
      </View>
      <IconButton
        icon="chevron-down"
        accessibilityLabel={t("Decrease {{part}}", { part: label })}
        onPressIn={() => startRepeating(-1)}
        onPressOut={stopRepeating}
        onPress={() => handlePress(-1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: 16,
  },
  dialog: {
    borderRadius: 20,
    maxWidth: 360,
    padding: 24,
    width: "100%",
  },
  formatBadge: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  separator: {
    alignSelf: "center",
    marginHorizontal: 8,
    marginTop: 18,
  },
  timePart: {
    alignItems: "center",
    flex: 1,
  },
  timeRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  timeValue: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 72,
    minWidth: 92,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginBottom: 8,
  },
});

AppTimePicker.displayName = "AppTimePicker";

export default AppTimePicker;
