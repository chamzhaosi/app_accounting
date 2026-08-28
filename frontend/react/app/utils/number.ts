import type { AmountValue } from "./amount";
import { toAmountNumber, toBigAmount } from "./amount";
import { getCurrencyDecimalDigits } from "../constants/currencies";

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatAmount = (amount: AmountValue): string =>
  amountFormatter.format(toAmountNumber(amount));

export const formatCompactAmount = (amount: AmountValue): string => {
  const value = toBigAmount(amount);
  const absoluteValue = value.abs();
  if (absoluteValue.gte(1_000_000))
    return `${value.div(1_000_000).toFixed(1)}m`;
  if (absoluteValue.gte(1_000)) return `${value.div(1_000).toFixed(1)}k`;
  return value.toFixed(0);
};

export const formatAbsoluteAmount = (amount: AmountValue): string =>
  formatAmount(toBigAmount(amount).abs());

export const formatSignedAmount = (amount: AmountValue): string => {
  const comparison = toBigAmount(amount).cmp(0);
  const prefix = comparison > 0 ? "+" : comparison < 0 ? "-" : "";
  return `${prefix}${formatAbsoluteAmount(amount)}`;
};

export const MASKED_AMOUNT = "***";

export const formatPrivateAmount = (
  amount: AmountValue,
  areAmountsVisible: boolean,
): string => (areAmountsVisible ? formatAmount(amount) : MASKED_AMOUNT);

export const formatPrivateCompactAmount = (
  amount: AmountValue,
  areAmountsVisible: boolean,
): string => (areAmountsVisible ? formatCompactAmount(amount) : MASKED_AMOUNT);

export const formatPrivateAbsoluteAmount = (
  amount: AmountValue,
  areAmountsVisible: boolean,
): string => (areAmountsVisible ? formatAbsoluteAmount(amount) : MASKED_AMOUNT);

export const formatPrivateSignedAmount = (
  amount: AmountValue,
  areAmountsVisible: boolean,
): string => (areAmountsVisible ? formatSignedAmount(amount) : MASKED_AMOUNT);

const getCurrencyFormatter = (
  locale: string,
  currencyCode: string,
  compact = false,
) => {
  const decimalDigits = getCurrencyDecimalDigits(currencyCode);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "code",
    ...(compact
      ? { notation: "compact", maximumFractionDigits: 1 }
      : {
          minimumFractionDigits: decimalDigits,
          maximumFractionDigits: decimalDigits,
        }),
  });
};

export const formatLocalizedAmount = (
  amount: AmountValue,
  currencyCode: string,
  locale: string,
  compact = false,
): string => {
  const decimalDigits = getCurrencyDecimalDigits(currencyCode);
  return new Intl.NumberFormat(locale, {
    ...(compact
      ? { notation: "compact", maximumFractionDigits: 1 }
      : {
          minimumFractionDigits: decimalDigits,
          maximumFractionDigits: decimalDigits,
        }),
  }).format(toAmountNumber(amount));
};

export const formatCurrencyAmount = (
  amount: AmountValue,
  currencyCode: string,
  locale: string,
  showCurrencyCode = true,
): string =>
  showCurrencyCode
    ? getCurrencyFormatter(locale, currencyCode).format(toAmountNumber(amount))
    : formatLocalizedAmount(amount, currencyCode, locale);

export const formatAbsoluteCurrencyAmount = (
  amount: AmountValue,
  currencyCode: string,
  locale: string,
  showCurrencyCode = true,
): string =>
  formatCurrencyAmount(
    toBigAmount(amount).abs(),
    currencyCode,
    locale,
    showCurrencyCode,
  );

export const formatSignedCurrencyAmount = (
  amount: AmountValue,
  currencyCode: string,
  locale: string,
  showCurrencyCode = true,
): string => {
  const comparison = toBigAmount(amount).cmp(0);
  const prefix = comparison > 0 ? "+" : comparison < 0 ? "-" : "";
  return `${prefix}${formatAbsoluteCurrencyAmount(
    amount,
    currencyCode,
    locale,
    showCurrencyCode,
  )}`;
};

export const formatCompactCurrencyAmount = (
  amount: AmountValue,
  currencyCode: string,
  locale: string,
  showCurrencyCode = true,
): string =>
  showCurrencyCode
    ? getCurrencyFormatter(locale, currencyCode, true).format(
        toAmountNumber(amount),
      )
    : formatLocalizedAmount(amount, currencyCode, locale, true);

export const formatPrivateCurrencyAmount = (
  amount: AmountValue,
  currencyCode: string,
  locale: string,
  areAmountsVisible: boolean,
  showCurrencyCode = true,
): string =>
  areAmountsVisible
    ? formatCurrencyAmount(amount, currencyCode, locale, showCurrencyCode)
    : showCurrencyCode
      ? `${currencyCode} ${MASKED_AMOUNT}`
      : MASKED_AMOUNT;

export const formatPrivateSignedCurrencyAmount = (
  amount: AmountValue,
  currencyCode: string,
  locale: string,
  areAmountsVisible: boolean,
  showCurrencyCode = true,
): string =>
  areAmountsVisible
    ? formatSignedCurrencyAmount(amount, currencyCode, locale, showCurrencyCode)
    : showCurrencyCode
      ? `${currencyCode} ${MASKED_AMOUNT}`
      : MASKED_AMOUNT;

export const formatPrivateCompactCurrencyAmount = (
  amount: AmountValue,
  currencyCode: string,
  locale: string,
  areAmountsVisible: boolean,
  showCurrencyCode = true,
): string =>
  areAmountsVisible
    ? formatCompactCurrencyAmount(
        amount,
        currencyCode,
        locale,
        showCurrencyCode,
      )
    : showCurrencyCode
      ? `${currencyCode} ${MASKED_AMOUNT}`
      : MASKED_AMOUNT;

export const formatPrivateLocalizedAmount = (
  amount: AmountValue,
  currencyCode: string,
  locale: string,
  areAmountsVisible: boolean,
): string => {
  if (!areAmountsVisible) return MASKED_AMOUNT;
  return formatLocalizedAmount(amount, currencyCode, locale);
};
