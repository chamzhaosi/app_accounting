import { TXN_TYPE_ENUM } from "../../constants/enum";
import { compareAmounts, isValidAmount } from "../../utils/amount";
import { CURRENCY_CODES } from "../../constants/currencies";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { getCurrencyPreferences } from "./currencyManagementService";
import { getAccMgmtByIdFromDB } from "../repo/accMgmtRepo";
import { getCategoryMgmtByIdFromDB } from "../repo/categoryMgmtRepo";
import {
  createNewTransactionMgmtToDB,
  deleteTransactionMgmtFromDB,
  getAccountDailyBalanceChangesFromDB,
  getAccountDateRangeFlowTotalsFromDB,
  getAccountForwardBalanceFromDB,
  getCategoryDateRangeSummaryFromDB,
  getCategoryDailyTotalsFromDB,
  getTransactionDailyTotalsFromDB,
  getTransactionDateRangeTotalsFromDB,
  getTransactionMgmtByIdFromDB,
  getTransactionOperationByIdFromDB,
  getTransactionMgmtListFromDB,
  getExchangeRateSuggestionFromDB,
  updateTransactionMgmtToDB,
} from "../repo/transactionMgmtRepo";
import {
  AccountDailyBalanceChangeType,
  AccountDateRangeFlowTotalsType,
  CategoryDailyTotalType,
  CategoryDateRangeSummaryType,
  TransactionDailyTotalsType,
  TransactionDateRangeTotalsType,
  TransactionMgmtCreateReqType,
  TransactionMgmtRspType,
  TransactionOperationRspType,
  TransactionMgmtUpdateReqType,
  ExchangeRateSuggestionType,
} from "../types/transactionMgmtType";

export const getExchangeRateSuggestion = async (
  fromCurrencyCode: string,
  toCurrencyCode: string,
  transactionDate: string,
  excludeTransactionId?: string,
): Promise<ExchangeRateSuggestionType | null> =>
  getExchangeRateSuggestionFromDB(
    fromCurrencyCode,
    toCurrencyCode,
    transactionDate,
    excludeTransactionId,
  );

export const getAccountDailyBalanceChanges = async (
  accountId: string,
  startDate: string,
  endDate: string,
): Promise<AccountDailyBalanceChangeType[]> =>
  getAccountDailyBalanceChangesFromDB(accountId, startDate, endDate);

export const getCategoryDailyTotals = async (
  categoryId: string,
  startDate: string,
  endDate: string,
): Promise<CategoryDailyTotalType[]> =>
  getCategoryDailyTotalsFromDB(categoryId, startDate, endDate);

export const getTransactionDailyTotals = async (
  startDate: string,
  endDate: string,
  currencyCode: string,
): Promise<TransactionDailyTotalsType[]> =>
  getTransactionDailyTotalsFromDB(startDate, endDate, currencyCode);

export const getAccountForwardBalance = async (
  accountId: string,
  startDate: string,
): Promise<number> => getAccountForwardBalanceFromDB(accountId, startDate);

export const getAccountDateRangeFlowTotals = async (
  accountId: string,
  startDate: string,
  endDate: string,
): Promise<AccountDateRangeFlowTotalsType> =>
  getAccountDateRangeFlowTotalsFromDB(accountId, startDate, endDate);

export const getCategoryDateRangeSummary = async (
  categoryId: string,
  startDate: string,
  endDate: string,
): Promise<CategoryDateRangeSummaryType> =>
  getCategoryDateRangeSummaryFromDB(categoryId, startDate, endDate);

export const getTransactionDateRangeTotals = async (
  startDate: string,
  endDate: string,
  currencyCode: string,
  accountId?: string,
): Promise<TransactionDateRangeTotalsType> =>
  getTransactionDateRangeTotalsFromDB(
    startDate,
    endDate,
    currencyCode,
    accountId,
  );

const CATEGORY_TYPE_IDS = {
  [TXN_TYPE_ENUM.INCOME]: 1,
  [TXN_TYPE_ENUM.EXPENSE]: 2,
  [TXN_TYPE_ENUM.TRANSFER]: 3,
  [TXN_TYPE_ENUM.ADJUSTMENT]: 3,
} as const;

export const getTransactionMgmtList = async (
  curPage: number,
  pageSize: number,
  startDate: string,
  endDate: string,
  accountId?: string,
  categoryId?: string,
): Promise<TransactionMgmtRspType[]> =>
  getTransactionMgmtListFromDB(
    {
      orderBy: [
        { column: "transactions.transaction_date", direction: "DESC" },
        { column: "transactions.created_at", direction: "DESC" },
      ],
      curPage,
      pageSize,
    },
    startDate,
    endDate,
    accountId,
    categoryId,
  );

export const getTransactionMgmtById = async (
  id: string,
): Promise<TransactionMgmtRspType | null> => getTransactionMgmtByIdFromDB(id);

export const getTransactionOperationById = async (
  id: string,
): Promise<TransactionOperationRspType | null> =>
  getTransactionOperationByIdFromDB(id);

const validateTransactionMgmt = async (
  data: TransactionMgmtCreateReqType,
): Promise<string | void> => {
  if (
    !isValidAmount(data.amount, data.currencyCode) ||
    compareAmounts(data.amount, 0) <= 0
  )
    return "Enter an amount using the transaction currency's decimal precision.";
  if (
    !isValidAmount(data.convertedAmount, data.accountCurrencyCode) ||
    compareAmounts(data.convertedAmount, 0) <= 0
  )
    return "Enter a valid account amount.";
  if (
    !CURRENCY_CODES.has(data.currencyCode) ||
    !CURRENCY_CODES.has(data.accountCurrencyCode)
  )
    return "Select valid transaction currencies.";
  const currencyPreferences = await getCurrencyPreferences();
  if (
    !currencyPreferences?.enabledCurrencyCodes.includes(data.currencyCode) ||
    !currencyPreferences.enabledCurrencyCodes.includes(data.accountCurrencyCode)
  )
    return "Transaction currencies must be enabled.";
  if (
    data.currencyCode === data.accountCurrencyCode &&
    compareAmounts(data.amount, data.convertedAmount) !== 0
  )
    return "Account amount must match the transaction amount when currencies are the same.";
  if (
    data.currencyCode !== data.accountCurrencyCode &&
    (!data.exchangeRate || Number(data.exchangeRate) <= 0)
  )
    return "Enter a valid exchange rate.";

  const feeAccountId =
    data.transactionType === TXN_TYPE_ENUM.TRANSFER
      ? data.fromAccountId
      : data.accountId;
  for (const fee of data.fees) {
    const feeCurrencyCode =
      data.transactionType === TXN_TYPE_ENUM.TRANSFER
        ? data.currencyCode
        : data.accountCurrencyCode;
    if (
      !isValidAmount(fee.amount, feeCurrencyCode) ||
      compareAmounts(fee.amount, 0) <= 0
    )
      return "Enter a valid fee amount.";
    if (fee.accountId !== feeAccountId)
      return "Fee account must match the transaction account.";
    const [feeAccount, feeCategory] = await Promise.all([
      getAccMgmtByIdFromDB(fee.accountId),
      getCategoryMgmtByIdFromDB(fee.categoryId),
    ]);
    if (!feeAccount?.is_active || !feeAccount.is_currency_enabled)
      return "A fee account is unavailable.";
    if (!feeCategory?.is_active || feeCategory.type_id !== 2)
      return "Select a valid expense category for every fee.";
  }

  if (data.transactionType === TXN_TYPE_ENUM.TRANSFER) {
    if (data.fromAccountId === data.toAccountId)
      return "From and To Accounts must be different.";

    const [fromAccount, toAccount] = await Promise.all([
      getAccMgmtByIdFromDB(data.fromAccountId),
      getAccMgmtByIdFromDB(data.toAccountId),
    ]);

    if (!fromAccount?.is_active || !fromAccount.is_currency_enabled)
      return "From Account is unavailable because its currency is disabled.";
    if (!toAccount?.is_active || !toAccount.is_currency_enabled)
      return "To Account is unavailable because its currency is disabled.";
    if (
      data.currencyCode !== fromAccount.currency_code ||
      data.accountCurrencyCode !== toAccount.currency_code
    )
      return "Transfer currencies must match the selected accounts.";
    return;
  }

  const [account, category] = await Promise.all([
    getAccMgmtByIdFromDB(data.accountId),
    getCategoryMgmtByIdFromDB(data.categoryId),
  ]);

  if (!account?.is_active || !account.is_currency_enabled)
    return "Selected account is unavailable because its currency is disabled.";
  if (data.accountCurrencyCode !== account.currency_code)
    return "Account currency does not match the selected account.";
  if (!category?.is_active) return "Selected category is unavailable.";

  const expectedCategoryTypeId = CATEGORY_TYPE_IDS[data.transactionType];
  if (category.type_id !== expectedCategoryTypeId) {
    debugLog(
      DEBUG_TAG.TRANSACTION_MANAGEMENT,
      "Rejected category type mismatch",
      {
        categoryId: data.categoryId,
        categoryTypeId: category.type_id,
        transactionType: data.transactionType,
      },
    );
    return "Selected category does not match the transaction type.";
  }
};

export const createNewTransactionMgmt = async (
  data: TransactionMgmtCreateReqType,
): Promise<string | void> => {
  const errorMessage = await validateTransactionMgmt(data);
  if (errorMessage) return errorMessage;

  await createNewTransactionMgmtToDB(data);
};

export const updateTransactionMgmt = async (
  data: TransactionMgmtUpdateReqType,
): Promise<string | void> => {
  const current = await getTransactionMgmtByIdFromDB(data.id);
  if (!current) return "Transaction not found.";

  const errorMessage = await validateTransactionMgmt(data);
  if (errorMessage) return errorMessage;

  await updateTransactionMgmtToDB(data);
};

export const deleteTransactionMgmt = async (
  id: string,
): Promise<string | void> => {
  const current = await getTransactionMgmtByIdFromDB(id);
  if (!current) return "Transaction not found.";

  await deleteTransactionMgmtFromDB(id);
};
