import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import {
  compareAmounts,
  isValidAmount,
  subtractAmounts,
} from "../../utils/amount";
import {
  createNewAccMgmtToDB,
  deleteAccMgmtFromDB,
  getAccMgmtByIdFromDB,
  getAccMgmtByTypeAndLabelFromDB,
  getAccMgmtListFromDB,
  getMainAccountBalanceFromDB,
  updateAccMgmtToDB,
} from "../repo/accMgmtRepo";
import { getCategoryMgmtByIdFromDB } from "../repo/categoryMgmtRepo";
import {
  AccMgmtCreateReqType,
  AccMgmtRspType,
  AccMgmtUpdateReqType,
} from "../types/accMgmtType";

export const getMainAccountBalance = async (): Promise<number> =>
  getMainAccountBalanceFromDB();

export const getAccMgmtList = async (
  curPage: number,
  pageSize: number,
): Promise<AccMgmtRspType[]> => {
  return await getAccMgmtListFromDB({
    orderBy: {
      column: "accounts.created_at",
      direction: "DESC",
    },
    curPage,
    pageSize,
  });
};

export const createNewAccMgmt = async (
  data: AccMgmtCreateReqType,
): Promise<string | void> => {
  if (!isValidAmount(data.currentBalance || "0"))
    return "Enter a balance with up to 13 integer digits and 2 decimal places.";

  const existData = await getAccMgmtByTypeAndLabelFromDB(
    data.typeId,
    data.label,
  );
  if (existData) {
    debugLog(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Duplicate label found when creating",
      {
        label: data.label,
        typeId: data.typeId,
        existingId: existData.id,
      },
    );
    return "Same label of account found.";
  }

  await createNewAccMgmtToDB(data);
};

export const getAccMgmtById = async (
  id: string,
): Promise<AccMgmtRspType | null> => {
  return await getAccMgmtByIdFromDB(id);
};

export const updateAccMgmt = async (data: AccMgmtUpdateReqType) => {
  if (!isValidAmount(data.currentBalance || "0"))
    return "Enter a balance with up to 13 integer digits and 2 decimal places.";

  const existData = await getAccMgmtByTypeAndLabelFromDB(
    data.typeId,
    data.label,
  );
  if (existData && existData.id !== data.id) {
    debugLog(
      DEBUG_TAG.ACCOUNT_MANAGEMENT,
      "Duplicate label found when updating",
      {
        id: data.id,
        label: data.label,
        typeId: data.typeId,
        existingId: existData.id,
      },
    );
    return "Same label of account found.";
  }

  const currentAccount = await getAccMgmtByIdFromDB(data.id);
  if (!currentAccount) return "Account not found.";

  const balanceDifference = subtractAmounts(
    data.currentBalance,
    currentAccount.current_balance,
  );

  if (compareAmounts(balanceDifference, 0) !== 0) {
    if (!data.balanceChangeKind)
      return "Choose how to record the balance difference.";

    const expectedKind =
      compareAmounts(balanceDifference, 0) < 0 ? "expense" : "income";
    if (
      data.balanceChangeKind !== "correction" &&
      data.balanceChangeKind !== expectedKind
    )
      return `A ${compareAmounts(balanceDifference, 0) < 0 ? "decrease" : "increase"} must be recorded as ${expectedKind} or a balance correction.`;

    if (data.balanceChangeKind !== "correction") {
      if (!data.balanceChangeCategoryId)
        return `Select a category for the missing ${expectedKind}.`;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.balanceChangeDate ?? ""))
        return `Select a date for the missing ${expectedKind}.`;

      const category = await getCategoryMgmtByIdFromDB(
        data.balanceChangeCategoryId,
      );
      const expectedTypeId = expectedKind === "expense" ? 2 : 1;
      if (!category?.is_active || category.type_id !== expectedTypeId)
        return `Selected category is unavailable for this ${expectedKind}.`;
    }
  }

  await updateAccMgmtToDB(data);
};

export const deleteAccMgmt = async (id: string) => {
  await deleteAccMgmtFromDB(id);
};
