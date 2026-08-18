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

export const formatMonthLabel = (month: string): string => {
  const date = parseDateValue(month);
  return date
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(date)
    : "";
};

export const getMonthEndKey = (month: string): string => {
  const date = parseDateValue(month) ?? new Date();
  return formatDateValue(new Date(date.getFullYear(), date.getMonth() + 1, 0));
};
