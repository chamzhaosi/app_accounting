export const formatDateValue = (date?: Date): string => {
  if (!date || Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getCurrentMonthDateRange = () => {
  const today = new Date();
  return {
    startDate: new Date(today.getFullYear(), today.getMonth(), 1),
    endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0),
  };
};

export const parseDateValue = (value?: string): Date | undefined => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const getMonthKey = (date = new Date()): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;

export const shiftMonth = (month: string, amount: number): string => {
  const date = parseDateValue(month) ?? new Date();
  return getMonthKey(new Date(date.getFullYear(), date.getMonth() + amount, 1));
};

export const formatMonthLabel = (month: string, locale = "en-US"): string => {
  const date = parseDateValue(month);
  return date ? formatMonthYearLabel(date, locale, "long") : "";
};

export const formatMonthName = (
  date: Date,
  locale = "en-US",
  month: "long" | "short" = "long",
) => {
  if (locale.startsWith("zh")) return `${date.getMonth() + 1}月`;

  const monthNames = locale.startsWith("ms")
    ? month === "long"
      ? MALAY_MONTHS
      : MALAY_SHORT_MONTHS
    : month === "long"
      ? ENGLISH_MONTHS
      : ENGLISH_SHORT_MONTHS;
  return monthNames[date.getMonth()];
};

export const formatMonthYearLabel = (
  date: Date,
  locale = "en-US",
  month: "long" | "short" = "long",
) => {
  const monthName = formatMonthName(date, locale, month);
  return locale.startsWith("zh")
    ? `${date.getFullYear()}年${monthName}`
    : `${monthName} ${date.getFullYear()}`;
};

export const formatLocalizedDateLabel = (
  date: Date,
  locale = "en-US",
  options: {
    includeWeekday?: boolean;
    includeYear?: boolean;
    month?: "long" | "short";
  } = {},
) => {
  const {
    includeWeekday = false,
    includeYear = true,
    month = "long",
  } = options;
  const monthName = formatMonthName(date, locale, month);
  const weekday = locale.startsWith("zh")
    ? CHINESE_WEEKDAYS[date.getDay()]
    : locale.startsWith("ms")
      ? MALAY_WEEKDAYS[date.getDay()]
      : ENGLISH_WEEKDAYS[date.getDay()];
  const dateLabel = locale.startsWith("zh")
    ? `${includeYear ? `${date.getFullYear()}年` : ""}${monthName}${date.getDate()}日`
    : locale.startsWith("ms")
      ? `${date.getDate()} ${monthName}${includeYear ? ` ${date.getFullYear()}` : ""}`
      : `${monthName} ${date.getDate()}${includeYear ? `, ${date.getFullYear()}` : ""}`;

  return includeWeekday ? `${weekday}, ${dateLabel}` : dateLabel;
};

export const formatSectionDate = (
  dateValue: string,
  locale: string,
  t: (text: string) => string,
) => {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;

  const today = new Date();
  const yesterday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 1,
  );
  const includeYear = date.getFullYear() !== today.getFullYear();
  const calendarDate = formatLocalizedDateLabel(date, locale, {
    includeYear,
  });

  if (dateValue === formatDateValue(today)) {
    return `${t("Today")} · ${calendarDate}`;
  }
  if (dateValue === formatDateValue(yesterday)) {
    return `${t("Yesterday")} · ${calendarDate}`;
  }

  return formatLocalizedDateLabel(date, locale, {
    includeWeekday: true,
    includeYear,
  });
};

const ENGLISH_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const ENGLISH_SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const MALAY_MONTHS = [
  "Januari",
  "Februari",
  "Mac",
  "April",
  "Mei",
  "Jun",
  "Julai",
  "Ogos",
  "September",
  "Oktober",
  "November",
  "Disember",
] as const;

const MALAY_SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mac",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Ogo",
  "Sep",
  "Okt",
  "Nov",
  "Dis",
] as const;

const ENGLISH_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MALAY_WEEKDAYS = ["Ahd", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"];
const CHINESE_WEEKDAYS = [
  "周日",
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六",
];

export const getMonthEndKey = (month: string): string => {
  const date = parseDateValue(month) ?? new Date();
  return formatDateValue(new Date(date.getFullYear(), date.getMonth() + 1, 0));
};
