const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatAmount = (amount: number): string =>
  amountFormatter.format(amount);

export const formatAbsoluteAmount = (amount: number): string =>
  formatAmount(Math.abs(amount));

export const formatSignedAmount = (amount: number): string => {
  const prefix = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${prefix}${formatAbsoluteAmount(amount)}`;
};
