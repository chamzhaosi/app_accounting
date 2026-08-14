import {
  createNewAccTypeToDB,
  deleteAccTypeFromDB,
  getAccTypeByIdFromDB,
  getAccTypeByLabelFromDB,
  getAccTypeListFromDB,
  updateAccTypeToDB,
} from "../repo/accTypeRepo";
import {
  AccTypCreateReqType,
  AccTypRspType,
  AccTypUpdateReqType,
} from "../types/accTypType";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";

export const getAccTypeList = async (
  curPage: number,
  pageSize: number,
): Promise<AccTypRspType[]> => {
  try {
    return await getAccTypeListFromDB({
      orderBy: {
        column: "created_at",
        direction: "DESC",
      },
      curPage,
      pageSize,
    });
  } catch (e) {
    throw e;
  }
};

export const createNewAccType = async (
  data: AccTypCreateReqType,
): Promise<string | void> => {
  try {
    const existData = await getAccTypeByLabelFromDB(data.label);
    if (existData) {
      debugLog(DEBUG_TAG.ACCOUNT_TYPE, "Duplicate label found when creating", {
        label: data.label,
        existingId: existData.id,
      });
      return "Same label of account type found.";
    }

    await createNewAccTypeToDB(data);
  } catch (e) {
    throw e;
  }
};

export const getAccTypeById = async (
  id: string,
): Promise<AccTypRspType | null> => {
  try {
    return await getAccTypeByIdFromDB(id);
  } catch (e) {
    throw e;
  }
};

export const updateAccType = async (data: AccTypUpdateReqType) => {
  try {
    const existData = await getAccTypeByLabelFromDB(data.label);
    if (existData && existData.id !== data.id) {
      debugLog(DEBUG_TAG.ACCOUNT_TYPE, "Duplicate label found when updating", {
        id: data.id,
        label: data.label,
        existingId: existData.id,
      });
      return "Same label of account type found.";
    }

    await updateAccTypeToDB(data);
  } catch (e) {
    throw e;
  }
};

export const deleteAccType = async (id: string) => {
  try {
    await deleteAccTypeFromDB(id);
  } catch (e) {
    throw e;
  }
};
