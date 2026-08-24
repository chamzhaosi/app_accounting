import Big from "big.js";

export const AMOUNT_INTEGER_DIGITS = 13;
export const AMOUNT_DECIMAL_PLACES = 2;
export const AMOUNT_MAX_LENGTH =
  AMOUNT_INTEGER_DIGITS + 1 + AMOUNT_DECIMAL_PLACES;
export const AMOUNT_MAX_VALUE = "9999999999999.99";
export const AMOUNT_PATTERN = /^\d{1,13}(?:\.\d{1,2})?$/;

export type AmountValue = Big.BigSource | null | undefined;

export const toBigAmount = (value: AmountValue): Big =>
  new Big(value === "" || value == null ? 0 : value);

export const isValidAmount = (value: string): boolean =>
  AMOUNT_PATTERN.test(value) && toBigAmount(value).lte(AMOUNT_MAX_VALUE);

export const isAmountWithinRange = (value: AmountValue): boolean =>
  toBigAmount(value).abs().lte(AMOUNT_MAX_VALUE);

export const toAmountNumber = (value: AmountValue): number =>
  Number(toBigAmount(value).round(AMOUNT_DECIMAL_PLACES).toFixed(2));

export const toAmountString = (value: AmountValue): string =>
  toBigAmount(value).round(AMOUNT_DECIMAL_PLACES).toFixed(2);

export const sumAmounts = (values: AmountValue[]): number =>
  toAmountNumber(
    values.reduce<Big>(
      (total, value) => total.plus(toBigAmount(value)),
      Big(0),
    ),
  );

export const addAmounts = (left: AmountValue, right: AmountValue): number =>
  toAmountNumber(toBigAmount(left).plus(toBigAmount(right)));

export const subtractAmounts = (
  left: AmountValue,
  right: AmountValue,
): number => toAmountNumber(toBigAmount(left).minus(toBigAmount(right)));

export const multiplyAmount = (
  value: AmountValue,
  multiplier: Big.BigSource,
): number => toAmountNumber(toBigAmount(value).times(multiplier));

export const prorateAmount = (
  value: AmountValue,
  numerator: Big.BigSource,
  denominator: Big.BigSource,
): number =>
  toAmountNumber(toBigAmount(value).times(numerator).div(denominator));

export const absoluteAmount = (value: AmountValue): number =>
  toAmountNumber(toBigAmount(value).abs());

export const compareAmounts = (
  left: AmountValue,
  right: AmountValue,
): Big.Comparison => toBigAmount(left).cmp(toBigAmount(right));

export const getAmountRatio = (
  numerator: AmountValue,
  denominator: AmountValue,
): number => {
  const divisor = toBigAmount(denominator);
  return divisor.eq(0) ? 0 : toBigAmount(numerator).div(divisor).toNumber();
};

export const getAmountPercentage = (
  numerator: AmountValue,
  denominator: AmountValue,
): number => {
  const divisor = toBigAmount(denominator);
  return divisor.eq(0)
    ? 0
    : toBigAmount(numerator).div(divisor).times(100).toNumber();
};
