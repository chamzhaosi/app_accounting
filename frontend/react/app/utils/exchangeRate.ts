import Big from "big.js";
import { toAmountString } from "./amount";

export const EXCHANGE_RATE_DECIMAL_PLACES = 6;
export const EXCHANGE_RATE_ZERO = `0.${"0".repeat(
  EXCHANGE_RATE_DECIMAL_PLACES,
)}`;

export const calculateConvertedAmount = (
  amount: string,
  exchangeRate: string,
): string => {
  try {
    if (!amount || !exchangeRate) return "";
    return toAmountString(new Big(amount).times(exchangeRate));
  } catch {
    return "";
  }
};

export const calculateExchangeRate = (
  amount: string,
  convertedAmount: string,
): string => {
  try {
    const sourceAmount = new Big(amount);
    if (sourceAmount.lte(0) || !convertedAmount) return "";
    return new Big(convertedAmount)
      .div(sourceAmount)
      .round(EXCHANGE_RATE_DECIMAL_PLACES)
      .toFixed(EXCHANGE_RATE_DECIMAL_PLACES);
  } catch {
    return "";
  }
};

export const formatExchangeRate = (rate: number | string): string => {
  try {
    return new Big(rate)
      .round(EXCHANGE_RATE_DECIMAL_PLACES)
      .toFixed(EXCHANGE_RATE_DECIMAL_PLACES);
  } catch {
    return rate.toString();
  }
};
