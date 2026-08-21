const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatAmount = (amount: number): string =>
  amountFormatter.format(amount);

export const formatCompactAmount = (amount: number): string => {
  const absoluteAmount = Math.abs(amount);
  if (absoluteAmount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}m`;
  if (absoluteAmount >= 1_000) return `${(amount / 1_000).toFixed(1)}k`;
  return amount.toFixed(0);
};

export const formatAbsoluteAmount = (amount: number): string =>
  formatAmount(Math.abs(amount));

export const formatSignedAmount = (amount: number): string => {
  const prefix = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${prefix}${formatAbsoluteAmount(amount)}`;
};
