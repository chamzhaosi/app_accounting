import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import { useTranslation } from "../i18n";
import {
  formatLocalizedDateLabel,
  formatMonthName,
  formatMonthYearLabel,
} from "../utils/date";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const CALENDAR_CELL_COUNT = 42;
const YEAR_PAGE_SIZE = 12;

type PickerView = "days" | "months" | "years";

export type CustomDatePickerProps = {
  value?: Date;
  onChange: (date: Date) => void;
  locale?: string;
  style?: StyleProp<ViewStyle>;
};

const isSameDay = (first?: Date, second?: Date) =>
  !!first &&
  !!second &&
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export default function CustomDatePicker({
  value,
  onChange,
  locale = "en-US",
  style,
}: CustomDatePickerProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    startOfMonth(value ?? new Date()),
  );
  const [pickerView, setPickerView] = useState<PickerView>("days");

  useEffect(() => {
    setSelectedDate(value);

    if (value && !Number.isNaN(value.getTime())) {
      setVisibleMonth(startOfMonth(value));
    }
  }, [value]);

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const mondayBasedStartDay = (new Date(year, month, 1).getDay() + 6) % 7;

    return Array.from(
      { length: CALENDAR_CELL_COUNT },
      (_, index) => new Date(year, month, index - mondayBasedStartDay + 1),
    );
  }, [visibleMonth]);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, month) =>
        formatMonthName(new Date(2000, month, 1), locale),
      ),
    [locale],
  );

  const visibleYear = visibleMonth.getFullYear();
  const yearRangeStart =
    Math.floor(visibleYear / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE;
  const years = Array.from(
    { length: YEAR_PAGE_SIZE },
    (_, index) => yearRangeStart + index,
  );
  const changePeriod = (offset: number) => {
    setVisibleMonth((current) => {
      if (pickerView === "days") {
        return new Date(current.getFullYear(), current.getMonth() + offset, 1);
      }

      const yearOffset = pickerView === "months" ? offset : offset * 12;
      return new Date(
        current.getFullYear() + yearOffset,
        current.getMonth(),
        1,
      );
    });
  };

  const headerLabel =
    pickerView === "days"
      ? formatMonthYearLabel(visibleMonth, locale)
      : pickerView === "months"
        ? String(visibleYear)
        : `${yearRangeStart} - ${yearRangeStart + YEAR_PAGE_SIZE - 1}`;

  const openNextView = () => {
    if (pickerView === "days") {
      setPickerView("months");
    } else if (pickerView === "months") {
      setPickerView("years");
    }
  };

  const periodName =
    pickerView === "days"
      ? "month"
      : pickerView === "months"
        ? "year"
        : "year range";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.secondaryContainer },
        style,
      ]}
    >
      <View style={styles.monthHeader}>
        <IconButton
          icon="chevron-left"
          accessibilityLabel={t(`Previous ${periodName}`)}
          iconColor={theme.colors.onSurface}
          onPress={() => changePeriod(-1)}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            pickerView === "days"
              ? t("Select month")
              : pickerView === "months"
                ? t("Select year")
                : headerLabel
          }
          disabled={pickerView === "years"}
          onPress={openNextView}
          style={styles.monthTitleButton}
        >
          <Text variant="titleMedium" style={styles.monthTitle}>
            {headerLabel}
          </Text>
        </Pressable>

        <IconButton
          icon="chevron-right"
          accessibilityLabel={t(`Next ${periodName}`)}
          iconColor={theme.colors.onSurface}
          onPress={() => changePeriod(1)}
        />
      </View>

      {pickerView === "days" ? (
        <>
          <View style={styles.weekRow}>
            {(locale.startsWith("zh")
              ? ["一", "二", "三", "四", "五", "六", "日"]
              : WEEK_DAYS
            ).map((day, index) => (
              <View key={`${day}-${index}`} style={styles.cell}>
                <Text
                  variant="labelMedium"
                  style={[
                    styles.weekDays,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((date) => {
              const selected = isSameDay(date, selectedDate);
              const outsideCurrentMonth =
                date.getFullYear() !== visibleMonth.getFullYear() ||
                date.getMonth() !== visibleMonth.getMonth();

              return (
                <View
                  key={date.toISOString()}
                  style={[
                    styles.cell,
                    selected && {
                      backgroundColor: theme.colors.tertiary,
                      borderRadius: 10,
                    },
                  ]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={formatLocalizedDateLabel(date, locale, {
                      includeWeekday: true,
                    })}
                    accessibilityState={{ selected }}
                    hitSlop={4}
                    onPress={() => {
                      setSelectedDate(date);

                      if (outsideCurrentMonth) {
                        setVisibleMonth(startOfMonth(date));
                      }

                      requestAnimationFrame(() => onChange(date));
                    }}
                    style={styles.dayContainer}
                  >
                    <Text
                      variant="bodyMedium"
                      style={[
                        styles.day,
                        {
                          color: selected
                            ? theme.colors.onPrimary
                            : outsideCurrentMonth
                              ? theme.colors.outlineVariant
                              : theme.colors.onSurface,
                        },
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </>
      ) : (
        <View style={styles.optionGrid}>
          {(pickerView === "months" ? months : years).map((option, index) => {
            const selected =
              pickerView === "months"
                ? visibleMonth.getMonth() === index
                : visibleYear === option;

            return (
              <View
                key={`${pickerView}-${option}`}
                style={[
                  selected && {
                    backgroundColor: theme.colors.primary,
                    borderRadius: 10,
                  },
                  styles.optionSlot,
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={String(option)}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    if (pickerView === "months") {
                      setVisibleMonth(new Date(visibleYear, index, 1));
                      setPickerView("days");
                    } else {
                      setVisibleMonth(
                        new Date(Number(option), visibleMonth.getMonth(), 1),
                      );
                      setPickerView("months");
                    }
                  }}
                  style={styles.dayContainer}
                >
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.day,
                      {
                        color: selected
                          ? theme.colors.onPrimary
                          : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 12,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthTitle: {
    textAlign: "center",
    fontSize: 18,
    width: "100%",
  },
  monthTitleButton: {
    flex: 0.5,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekDays: {
    fontSize: 18,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 10,
  },
  cell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dayContainer: {
    display: "flex",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  day: {
    fontSize: 18,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 4,
  },
  optionSlot: {
    alignItems: "center",
    width: `${100 / 3}%`,
    height: 50,
  },
  option: {
    backgroundColor: "red",
    width: "100%",
    height: 58,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
