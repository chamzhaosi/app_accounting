import Big from "big.js";
import {
  getCurrencyDecimalDigits,
  MAX_CURRENCY_DECIMAL_DIGITS,
} from "../constants/currencies";

export const AMOUNT_INTEGER_DIGITS = 13;
export const AMOUNT_DECIMAL_PLACES = MAX_CURRENCY_DECIMAL_DIGITS;
export const AMOUNT_MAX_LENGTH =
  AMOUNT_INTEGER_DIGITS + 1 + AMOUNT_DECIMAL_PLACES;
export const AMOUNT_MAX_VALUE = "9999999999999.999";
export const AMOUNT_PATTERN = /^\d{1,13}(?:\.\d{1,3})?$/;

export const getAmountPattern = (decimalPlaces: number): RegExp =>
  decimalPlaces === 0
    ? /^\d{1,13}$/
    : new RegExp(`^\\d{1,13}(?:\\.\\d{1,${decimalPlaces}})?$`);

export const getAmountMaxLength = (currencyCode?: string): number => {
  const decimalPlaces = getCurrencyDecimalDigits(currencyCode);
  return AMOUNT_INTEGER_DIGITS + (decimalPlaces > 0 ? decimalPlaces + 1 : 0);
};

export type AmountValue = Big.BigSource | null | undefined;

export const toBigAmount = (value: AmountValue): Big =>
  new Big(value === "" || value == null ? 0 : value);

export const isValidAmount = (value: string, currencyCode?: string): boolean =>
  getAmountPattern(getCurrencyDecimalDigits(currencyCode)).test(value) &&
  toBigAmount(value).lte(AMOUNT_MAX_VALUE);

export const isAmountWithinRange = (value: AmountValue): boolean =>
  toBigAmount(value).abs().lte(AMOUNT_MAX_VALUE);

export const toAmountNumber = (
  value: AmountValue,
  decimalPlaces = AMOUNT_DECIMAL_PLACES,
): number =>
  Number(toBigAmount(value).round(decimalPlaces).toFixed(decimalPlaces));

export const toAmountString = (
  value: AmountValue,
  currencyCode?: string,
): string => {
  const decimalPlaces = getCurrencyDecimalDigits(currencyCode);
  return toBigAmount(value).round(decimalPlaces).toFixed(decimalPlaces);
};

export const getZeroAmount = (currencyCode?: string): string =>
  toAmountString(0, currencyCode);

export const toCurrencyAmountNumber = (
  value: AmountValue,
  currencyCode?: string,
): number => toAmountNumber(value, getCurrencyDecimalDigits(currencyCode));

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
