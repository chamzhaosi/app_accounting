import { formatDateValue } from "./date";

const dateAtDay = (year: number, month: number, day: number) => {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay));
};

export const getCurrentCreditCardCycleDates = (
  statementDay: number,
  dueDay: number,
  now = new Date(),
) => {
  if (
    !Number.isInteger(statementDay) ||
    statementDay < 1 ||
    statementDay > 31 ||
    !Number.isInteger(dueDay) ||
    dueDay < 1 ||
    dueDay > 31
  ) {
    return undefined;
  }

  let statementDate = dateAtDay(
    now.getFullYear(),
    now.getMonth(),
    statementDay,
  );
  if (statementDate > now) {
    statementDate = dateAtDay(
      now.getFullYear(),
      now.getMonth() - 1,
      statementDay,
    );
  }

  let dueDate = dateAtDay(
    statementDate.getFullYear(),
    statementDate.getMonth(),
    dueDay,
  );
  if (dueDate <= statementDate) {
    dueDate = dateAtDay(
      statementDate.getFullYear(),
      statementDate.getMonth() + 1,
      dueDay,
    );
  }

  return {
    statementDate: formatDateValue(statementDate),
    dueDate: formatDateValue(dueDate),
  };
};
