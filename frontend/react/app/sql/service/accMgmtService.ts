import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import {
  createNewAccMgmtToDB,
  deleteAccMgmtFromDB,
  getAccMgmtByIdFromDB,
  getAccMgmtByTypeAndLabelFromDB,
  getAccMgmtListFromDB,
  getMainAccountBalanceFromDB,
  updateAccMgmtToDB,
} from "../repo/accMgmtRepo";
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

  await updateAccMgmtToDB(data);
};

export const deleteAccMgmt = async (id: string) => {
  await deleteAccMgmtFromDB(id);
};
