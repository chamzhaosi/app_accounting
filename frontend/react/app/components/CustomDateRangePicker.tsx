import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import { useTranslation } from "../i18n/helper";
import { useThemeStore } from "../stores/useThemeStore";
import {
  formatLocalizedDateLabel,
  formatMonthName,
  formatMonthYearLabel,
} from "../utils/date";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const CALENDAR_CELL_COUNT = 42;
const YEAR_PAGE_SIZE = 12;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

type PickerView = "days" | "months" | "years";

export type AppDateRangeValue = {
  startDate?: Date;
  endDate?: Date;
};

type CustomDateRangePickerProps = {
  value?: AppDateRangeValue;
  onChange: (range: AppDateRangeValue) => void;
  disableFutureDates?: boolean;
  maxRangeDays?: number;
  locale?: string;
  style?: StyleProp<ViewStyle>;
};

const isSameDay = (first?: Date, second?: Date) =>
  !!first &&
  !!second &&
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const getCalendarDayNumber = (date: Date) =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) /
  MILLISECONDS_PER_DAY;

const isWithinRange = (date: Date, range: AppDateRangeValue) => {
  if (!range.startDate || !range.endDate) return false;

  const time = startOfDay(date).getTime();
  return (
    time > startOfDay(range.startDate).getTime() &&
    time < startOfDay(range.endDate).getTime()
  );
};

export default function CustomDateRangePicker({
  value,
  onChange,
  disableFutureDates = false,
  maxRangeDays,
  locale = "en-US",
  style,
}: CustomDateRangePickerProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { THEME } = useThemeStore();
  const today = startOfDay(new Date());
  const normalizedMaxRangeDays =
    maxRangeDays !== undefined &&
    Number.isFinite(maxRangeDays) &&
    maxRangeDays >= 1
      ? Math.floor(maxRangeDays)
      : undefined;
  const [selectedRange, setSelectedRange] = useState<AppDateRangeValue>(
    value ?? {},
  );
  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    startOfMonth(value?.startDate ?? new Date()),
  );
  const [pickerView, setPickerView] = useState<PickerView>("days");

  useEffect(() => {
    setSelectedRange(value ?? {});

    if (value?.startDate && !Number.isNaN(value.startDate.getTime())) {
      setVisibleMonth(startOfMonth(value.startDate));
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
  const isNextPeriodDisabled =
    disableFutureDates &&
    (pickerView === "days"
      ? visibleYear > today.getFullYear() ||
        (visibleYear === today.getFullYear() &&
          visibleMonth.getMonth() >= today.getMonth())
      : pickerView === "months"
        ? visibleYear >= today.getFullYear()
        : yearRangeStart + YEAR_PAGE_SIZE - 1 >= today.getFullYear());

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
    if (pickerView === "days") setPickerView("months");
    else if (pickerView === "months") setPickerView("years");
  };

  const periodName =
    pickerView === "days"
      ? "month"
      : pickerView === "months"
        ? "year"
        : "year range";

  const selectDate = (date: Date, outsideCurrentMonth: boolean) => {
    const normalizedDate = startOfDay(date);

    if (
      selectedRange.startDate &&
      !selectedRange.endDate &&
      normalizedMaxRangeDays !== undefined &&
      Math.abs(
        getCalendarDayNumber(normalizedDate) -
          getCalendarDayNumber(selectedRange.startDate),
      ) +
        1 >
        normalizedMaxRangeDays
    ) {
      return;
    }

    let nextRange: AppDateRangeValue;

    if (!selectedRange.startDate || selectedRange.endDate) {
      nextRange = { startDate: normalizedDate };
    } else if (normalizedDate < startOfDay(selectedRange.startDate)) {
      nextRange = {
        startDate: normalizedDate,
        endDate: startOfDay(selectedRange.startDate),
      };
    } else {
      nextRange = {
        startDate: startOfDay(selectedRange.startDate),
        endDate: normalizedDate,
      };
    }

    setSelectedRange(nextRange);

    if (outsideCurrentMonth) setVisibleMonth(startOfMonth(normalizedDate));

    requestAnimationFrame(() => onChange(nextRange));
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: THEME.surfaceContainerHigh },
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
          disabled={isNextPeriodDisabled}
          iconColor={theme.colors.onSurface}
          onPress={() => changePeriod(1)}
        />
      </View>

      {pickerView === "days" ? (
        <>
          {normalizedMaxRangeDays !== undefined && (
            <Text
              variant="labelSmall"
              style={[
                styles.rangeLimitHint,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {t("Select up to {{days}} days", {
                days: normalizedMaxRangeDays,
              })}
            </Text>
          )}
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
              const isRangeStart = isSameDay(date, selectedRange.startDate);
              const isRangeEnd = isSameDay(date, selectedRange.endDate);
              const isEndpoint = isRangeStart || isRangeEnd;
              const withinRange = isWithinRange(date, selectedRange);
              const outsideCurrentMonth =
                date.getFullYear() !== visibleYear ||
                date.getMonth() !== visibleMonth.getMonth();
              const isFutureDate =
                disableFutureDates && startOfDay(date) > today;
              const exceedsMaxRange =
                !!selectedRange.startDate &&
                !selectedRange.endDate &&
                normalizedMaxRangeDays !== undefined &&
                Math.abs(
                  getCalendarDayNumber(date) -
                    getCalendarDayNumber(selectedRange.startDate),
                ) +
                  1 >
                  normalizedMaxRangeDays;
              const isDateDisabled = isFutureDate || exceedsMaxRange;

              return (
                <View
                  key={date.toISOString()}
                  style={[
                    styles.cell,
                    withinRange && {
                      backgroundColor: theme.colors.primaryContainer,
                    },
                    isEndpoint && {
                      backgroundColor: theme.colors.primary,
                      borderRadius: 10,
                    },
                  ]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={formatLocalizedDateLabel(date, locale, {
                      includeWeekday: true,
                    })}
                    accessibilityState={{
                      disabled: isDateDisabled,
                      selected: isEndpoint,
                    }}
                    disabled={isDateDisabled}
                    hitSlop={4}
                    onPress={() => selectDate(date, outsideCurrentMonth)}
                    style={styles.dayContainer}
                  >
                    <Text
                      variant="bodyMedium"
                      style={[
                        styles.day,
                        {
                          color: isDateDisabled
                            ? theme.colors.outlineVariant
                            : isEndpoint
                              ? theme.colors.onPrimary
                              : outsideCurrentMonth
                                ? theme.colors.outline
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
            const disabled =
              disableFutureDates &&
              (pickerView === "months"
                ? visibleYear > today.getFullYear() ||
                  (visibleYear === today.getFullYear() &&
                    index > today.getMonth())
                : Number(option) > today.getFullYear());

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
                  accessibilityState={{ disabled, selected }}
                  disabled={disabled}
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
                        color: disabled
                          ? theme.colors.outlineVariant
                          : selected
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
    borderRadius: 16,
    maxWidth: 400,
    padding: 12,
    width: "100%",
  },
  monthHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  monthTitle: {
    fontSize: 18,
    textAlign: "center",
    width: "100%",
  },
  monthTitleButton: {
    alignItems: "center",
    flex: 0.5,
    justifyContent: "center",
    minHeight: 44,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  rangeLimitHint: {
    paddingBottom: 8,
    textAlign: "center",
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
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: `${100 / 7}%`,
  },
  dayContainer: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    width: "100%",
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
    height: 50,
    width: `${100 / 3}%`,
  },
});
