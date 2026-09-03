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
  getTransactionPeriodCurrencyCodesFromDB,
  getTransactionMgmtByIdFromDB,
  getTransactionOperationByIdFromDB,
  getTransactionMgmtListFromDB,
  getExchangeRateSuggestionFromDB,
  getFrequentTransactionDescriptionsFromDB,
  updateTransactionMgmtToDB,
} from "../repo/transactionMgmtRepo";
import { reconcileAllCreditCards } from "./creditCardService";
import {
  assertAttachmentLimit,
  finalizeStagedAttachmentFiles,
  getTransactionAttachments,
  restoreStagedAttachmentFiles,
  stageAttachmentFiles,
} from "./transactionAttachmentService";
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
  currencyCode: string,
): Promise<CategoryDailyTotalType[]> =>
  getCategoryDailyTotalsFromDB(categoryId, startDate, endDate, currencyCode);

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
  currencyCode?: string,
): Promise<CategoryDateRangeSummaryType[]> =>
  getCategoryDateRangeSummaryFromDB(
    categoryId,
    startDate,
    endDate,
    currencyCode,
  );

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

export const getTransactionPeriodCurrencyCodes = async (
  startDate: string,
  endDate: string,
  categoryId?: string,
): Promise<string[]> =>
  getTransactionPeriodCurrencyCodesFromDB(startDate, endDate, categoryId);

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
  currencyCode?: string,
  creditCardStatementDate?: string,
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
    currencyCode,
    creditCardStatementDate,
  );

export const getTransactionMgmtById = async (
  id: string,
): Promise<TransactionMgmtRspType | null> => getTransactionMgmtByIdFromDB(id);

export const getFrequentTransactionDescriptions = async (
  categoryId: string,
  searchText = "",
): Promise<string[]> =>
  getFrequentTransactionDescriptionsFromDB(categoryId, searchText);

export const getTransactionOperationById = async (
  id: string,
): Promise<TransactionOperationRspType | null> =>
  getTransactionOperationByIdFromDB(id);

const validateTransactionMgmt = async (
  data: TransactionMgmtCreateReqType,
  current?: TransactionMgmtRspType,
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
  const enabledCurrencyCodes = currencyPreferences?.enabledCurrencyCodes ?? [];
  if (
    (!enabledCurrencyCodes.includes(data.currencyCode) &&
      data.currencyCode !== current?.currency_code) ||
    (!enabledCurrencyCodes.includes(data.accountCurrencyCode) &&
      data.accountCurrencyCode !== current?.account_currency_code)
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
    const isSavedAccount =
      feeAccount?.id === current?.account_id ||
      feeAccount?.id === current?.from_account_id ||
      feeAccount?.id === current?.to_account_id;
    if (!feeAccount) return "A fee account is unavailable.";
    if (
      (!feeAccount.is_active && !isSavedAccount) ||
      (!feeAccount.is_currency_enabled && !isSavedAccount)
    )
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

    if (!fromAccount) return "From Account is unavailable.";
    if (!toAccount) return "To Account is unavailable.";

    if (
      (!fromAccount.is_active && fromAccount.id !== current?.from_account_id) ||
      (!fromAccount.is_currency_enabled &&
        fromAccount.id !== current?.from_account_id)
    )
      return "From Account is unavailable.";
    if (
      (!toAccount.is_active && toAccount.id !== current?.to_account_id) ||
      (!toAccount.is_currency_enabled &&
        toAccount.id !== current?.to_account_id)
    )
      return "To Account is unavailable.";
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

  if (!account) return "Selected account is unavailable.";

  if (
    (!account.is_active && account.id !== current?.account_id) ||
    (!account.is_currency_enabled && account.id !== current?.account_id)
  )
    return "Selected account is unavailable.";
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
): Promise<{ id?: string; errorMessage?: string }> => {
  const errorMessage = await validateTransactionMgmt(data);
  if (errorMessage) return { errorMessage };
  const attachmentError = assertAttachmentLimit(0, data.attachments);
  if (attachmentError) return { errorMessage: attachmentError };

  const id = await createNewTransactionMgmtToDB(data);
  await reconcileAllCreditCards();
  return { id };
};

export const updateTransactionMgmt = async (
  data: TransactionMgmtUpdateReqType,
): Promise<string | void> => {
  const current = await getTransactionMgmtByIdFromDB(data.id);
  if (!current) return "Transaction not found.";

  const errorMessage = await validateTransactionMgmt(data, current);
  if (errorMessage) return errorMessage;

  const existingAttachments = await getTransactionAttachments(data.id);
  const removedIds = new Set(data.removedAttachmentIds);
  const removedAttachments = existingAttachments.filter((attachment) =>
    removedIds.has(attachment.id),
  );
  if (removedAttachments.length !== removedIds.size) {
    return "One or more attachments are unavailable.";
  }
  const attachmentError = assertAttachmentLimit(
    existingAttachments.length - removedAttachments.length,
    data.attachments,
  );
  if (attachmentError) return attachmentError;

  const stagedFiles = await stageAttachmentFiles(removedAttachments);
  try {
    await updateTransactionMgmtToDB(data);
  } catch (e) {
    await restoreStagedAttachmentFiles(stagedFiles);
    throw e;
  }
  try {
    await finalizeStagedAttachmentFiles(stagedFiles);
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_ATTACHMENT,
      "Unable to finalize removed attachment files",
      e,
    );
  }
  await reconcileAllCreditCards();
};

export const deleteTransactionMgmt = async (
  id: string,
): Promise<string | void> => {
  const current = await getTransactionMgmtByIdFromDB(id);
  if (!current) return "Transaction not found.";

  const attachments = await getTransactionAttachments(id);
  const stagedFiles = await stageAttachmentFiles(attachments);
  try {
    await deleteTransactionMgmtFromDB(id);
  } catch (e) {
    await restoreStagedAttachmentFiles(stagedFiles);
    throw e;
  }
  try {
    await finalizeStagedAttachmentFiles(stagedFiles);
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_ATTACHMENT,
      "Unable to finalize deleted attachment files",
      e,
    );
  }
  await reconcileAllCreditCards();
};
