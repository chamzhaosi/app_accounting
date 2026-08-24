import type { AmountValue } from "./amount";
import { toAmountNumber, toBigAmount } from "./amount";

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
