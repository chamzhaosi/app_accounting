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

export const getAccTypeList = async (): Promise<AccTypRspType[]> => {
  try {
    return await getAccTypeListFromDB();
  } catch (e) {
    throw e;
  }
};

export const createNewAccType = async (
  data: AccTypCreateReqType,
): Promise<string | void> => {
  try {
    const existData = await getAccTypeByLabelFromDB(data.label);
    if (existData) return "Same label of account type found.";

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
    if (existData && existData.id !== data.id)
      return "Same label of account type found.";

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
