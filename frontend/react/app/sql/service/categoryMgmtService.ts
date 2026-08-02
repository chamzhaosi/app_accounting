import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import {
  createNewCategoryMgmtToDB,
  deleteCategoryMgmtFromDB,
  getCategoryMgmtByIdFromDB,
  getCategoryMgmtByTypeAndLabelFromDB,
  getCategoryMgmtListFromDB,
  updateCategoryMgmtToDB,
} from "../repo/categoryMgmtRepo";
import {
  CategoryMgmtCreateReqType,
  CategoryMgmtRspType,
  CategoryMgmtUpdateReqType,
} from "../types/categoryMgmtType";

export const getCategoryMgmtList = async (
  typeId: number,
  curPage: number,
  pageSize: number,
): Promise<CategoryMgmtRspType[]> =>
  getCategoryMgmtListFromDB({
    typeId,
    orderBy: [
      { column: "created_at", direction: "ASC" },
      { column: "label", direction: "ASC" },
    ],
    curPage,
    pageSize,
  });

export const createNewCategoryMgmt = async (
  data: CategoryMgmtCreateReqType,
): Promise<string | void> => {
  const existing = await getCategoryMgmtByTypeAndLabelFromDB(
    data.typeId,
    data.label,
  );
  if (existing) {
    debugLog(
      DEBUG_TAG.CATEGORY_MANAGEMENT,
      "Duplicate label found when creating",
      {
        typeId: data.typeId,
        label: data.label,
        existingId: existing.id,
      },
    );
    return "Same category label found for this transaction type.";
  }

  await createNewCategoryMgmtToDB(data);
};

export const getCategoryMgmtById = async (
  id: string,
): Promise<CategoryMgmtRspType | null> => getCategoryMgmtByIdFromDB(id);

export const updateCategoryMgmt = async (
  data: CategoryMgmtUpdateReqType,
): Promise<string | void> => {
  const current = await getCategoryMgmtByIdFromDB(data.id);
  if (!current) return "Category not found.";
  if (current.is_system) return "System-created categories cannot be edited.";

  const existing = await getCategoryMgmtByTypeAndLabelFromDB(
    data.typeId,
    data.label,
  );
  if (existing && existing.id !== data.id) {
    debugLog(
      DEBUG_TAG.CATEGORY_MANAGEMENT,
      "Duplicate label found when updating",
      {
        id: data.id,
        typeId: data.typeId,
        label: data.label,
        existingId: existing.id,
      },
    );
    return "Same category label found for this transaction type.";
  }

  await updateCategoryMgmtToDB(data);
};

export const deleteCategoryMgmt = async (
  id: string,
): Promise<string | void> => {
  const current = await getCategoryMgmtByIdFromDB(id);
  if (!current) return "Category not found.";
  if (current.is_system) return "System-created categories cannot be deleted.";

  await deleteCategoryMgmtFromDB(id);
};
