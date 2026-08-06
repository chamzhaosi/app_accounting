import { TXN_TYPE_ENUM } from "../../constants/enum";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { getAccMgmtByIdFromDB } from "../repo/accMgmtRepo";
import { getCategoryMgmtByIdFromDB } from "../repo/categoryMgmtRepo";
import {
  createNewTransactionMgmtToDB,
  getTransactionMgmtListFromDB,
} from "../repo/transactionMgmtRepo";
import {
  TransactionMgmtCreateReqType,
  TransactionMgmtRspType,
} from "../types/transactionMgmtType";

const CATEGORY_TYPE_IDS = {
  [TXN_TYPE_ENUM.INCOME]: 1,
  [TXN_TYPE_ENUM.EXPENSE]: 2,
  [TXN_TYPE_ENUM.TRANSFER]: 3,
  [TXN_TYPE_ENUM.ADJUSTMENT]: 3,
} as const;

export const getTransactionMgmtList = async (
  curPage: number,
  pageSize: number,
): Promise<TransactionMgmtRspType[]> =>
  getTransactionMgmtListFromDB({
    orderBy: [
      { column: "transactions.transaction_date", direction: "DESC" },
      { column: "transactions.created_at", direction: "DESC" },
    ],
    curPage,
    pageSize,
  });

export const createNewTransactionMgmt = async (
  data: TransactionMgmtCreateReqType,
): Promise<string | void> => {
  if (data.transactionType === TXN_TYPE_ENUM.TRANSFER) {
    if (data.fromAccountId === data.toAccountId)
      return "From and To Accounts must be different.";

    const [fromAccount, toAccount] = await Promise.all([
      getAccMgmtByIdFromDB(data.fromAccountId),
      getAccMgmtByIdFromDB(data.toAccountId),
    ]);

    if (!fromAccount?.is_active) return "From Account is unavailable.";
    if (!toAccount?.is_active) return "To Account is unavailable.";
  } else {
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
  }

  await createNewTransactionMgmtToDB(data);
};
