export const getTransactionAccountDisplayLabel = (
  accountLabel: string,
  currencyCode: string,
  isSingleCurrency: boolean,
): string =>
  isSingleCurrency ? accountLabel : `${currencyCode} - ${accountLabel}`;
