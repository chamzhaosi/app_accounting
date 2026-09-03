import type { AppIconProps } from "../../components/AppIcon";
import { TXN_TYPE_ENUM } from "../../constants/enum";
import type { TransactionMgmtRspType } from "../../sql/types/transactionMgmtType";
import { compareAmounts, multiplyAmount } from "../../utils/amount";
import { capitalizeFirst } from "../../utils/text";
import { getCategoryDisplayLabel } from "../category_management/categoryManagementList.utils";
import { getTransactionAccountDisplayLabel } from "./transactionAccount.utils";

export type TransactionListItem = {
  description?: string;
  id: string;
  icon: AppIconProps["name"];
  title: string;
  subtitle: string;
  fromAccountLabel?: string;
  toAccountLabel?: string;
  accountId?: string;
  primaryAmount: number;
  primaryCurrencyCode: string;
  secondaryAmount?: number;
  secondaryCurrencyCode?: string;
  balanceEffect: number;
  dailyNetEffect: number;
  transactionType: TXN_TYPE_ENUM;
  transactionDate: string;
  hasAttachments: boolean;
};

type MapTransactionListItemOptions = {
  accountId?: string;
  isSingleCurrency: boolean;
  t: (text: string, values?: Record<string, string | number>) => string;
};

export const mapTransactionListItem = (
  transaction: TransactionMgmtRspType,
  { accountId, isSingleCurrency, t }: MapTransactionListItemOptions,
): TransactionListItem => {
  const isIncome = transaction.transaction_type === TXN_TYPE_ENUM.INCOME;
  const isExpense = transaction.transaction_type === TXN_TYPE_ENUM.EXPENSE;
  const isTransfer = transaction.transaction_type === TXN_TYPE_ENUM.TRANSFER;
  const isViewingOutgoingTransfer =
    isTransfer && transaction.from_account_id === accountId;
  const primaryAmount = isViewingOutgoingTransfer
    ? transaction.amount
    : transaction.converted_amount;
  const primaryCurrencyCode = isViewingOutgoingTransfer
    ? transaction.currency_code
    : transaction.account_currency_code;
  const balanceEffect = isIncome
    ? primaryAmount
    : isExpense
      ? multiplyAmount(primaryAmount, -1)
      : isTransfer
        ? accountId
          ? isViewingOutgoingTransfer
            ? multiplyAmount(primaryAmount, -1)
            : primaryAmount
          : primaryAmount
        : transaction.converted_amount;
  const hasDifferentCurrencies =
    transaction.currency_code !== transaction.account_currency_code;
  const title =
    isIncome || isExpense
      ? getCategoryDisplayLabel(
          transaction.category_label ??
            capitalizeFirst(transaction.transaction_type),
          transaction.category_translation_key,
          t,
        )
      : isTransfer
        ? t("Transfer")
        : t("Balance Adjustment");
  const subtitle =
    isIncome || isExpense
      ? getTransactionAccountDisplayLabel(
          transaction.account_label ?? t("Account"),
          transaction.account_currency_code,
          isSingleCurrency,
        )
      : isTransfer
        ? `${transaction.from_account_label ?? t("Account")} → ${transaction.to_account_label ?? t("Account")}`
        : `${getTransactionAccountDisplayLabel(
            transaction.account_label ?? t("Account"),
            transaction.account_currency_code,
            isSingleCurrency,
          )} · ${t("Balance {{direction}}", {
            direction: t(
              compareAmounts(transaction.amount, 0) > 0
                ? "increased"
                : "decreased",
            ),
          })}`;

  return {
    description: transaction.descriptions?.trim() || undefined,
    id: transaction.id,
    icon: (transaction.category_icon ??
      (isTransfer ? "ArrowLeftRight" : "WalletCards")) as AppIconProps["name"],
    title,
    subtitle,
    fromAccountLabel: isTransfer
      ? getTransactionAccountDisplayLabel(
          transaction.from_account_label ?? t("Account"),
          transaction.currency_code,
          isSingleCurrency,
        )
      : undefined,
    toAccountLabel: isTransfer
      ? getTransactionAccountDisplayLabel(
          transaction.to_account_label ?? t("Account"),
          transaction.account_currency_code,
          isSingleCurrency,
        )
      : undefined,
    accountId: transaction.account_id ?? undefined,
    primaryAmount,
    primaryCurrencyCode,
    secondaryAmount: hasDifferentCurrencies
      ? isViewingOutgoingTransfer
        ? transaction.converted_amount
        : transaction.amount
      : undefined,
    secondaryCurrencyCode: hasDifferentCurrencies
      ? isViewingOutgoingTransfer
        ? transaction.account_currency_code
        : transaction.currency_code
      : undefined,
    balanceEffect,
    dailyNetEffect: isTransfer && !accountId ? 0 : balanceEffect,
    transactionType: transaction.transaction_type,
    transactionDate: transaction.transaction_date,
    hasAttachments: Boolean(transaction.has_attachments),
  };
};
