import { TXN_TYPE_ENUM } from "../../constants/enum";
import { compareAmounts, isValidAmount } from "../../utils/amount";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
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
  getTransactionMgmtListFromDB,
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
  TransactionMgmtUpdateReqType,
} from "../types/transactionMgmtType";

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
): Promise<TransactionDailyTotalsType[]> =>
  getTransactionDailyTotalsFromDB(startDate, endDate);

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
  accountId?: string,
): Promise<TransactionDateRangeTotalsType> =>
  getTransactionDateRangeTotalsFromDB(startDate, endDate, accountId);

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

const validateTransactionMgmt = async (
  data: TransactionMgmtCreateReqType,
): Promise<string | void> => {
  if (!isValidAmount(data.amount) || compareAmounts(data.amount, 0) <= 0)
    return "Enter an amount with up to 13 integer digits and 2 decimal places.";

  if (data.transactionType === TXN_TYPE_ENUM.TRANSFER) {
    if (data.fromAccountId === data.toAccountId)
      return "From and To Accounts must be different.";

    const [fromAccount, toAccount] = await Promise.all([
      getAccMgmtByIdFromDB(data.fromAccountId),
      getAccMgmtByIdFromDB(data.toAccountId),
    ]);

    if (!fromAccount?.is_active) return "From Account is unavailable.";
    if (!toAccount?.is_active) return "To Account is unavailable.";
    return;
  }

  const [account, category] = await Promise.all([
    getAccMgmtByIdFromDB(data.accountId),
    getCategoryMgmtByIdFromDB(data.categoryId),
  ]);

  if (!account?.is_active) return "Selected account is unavailable.";
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
