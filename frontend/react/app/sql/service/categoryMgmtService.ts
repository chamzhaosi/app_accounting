import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import {
  createNewCategoryMgmtToDB,
  deleteCategoryMgmtFromDB,
  getCategoryMgmtByIdFromDB,
  getCategoryMgmtByTypeAndLabelFromDB,
  getCategoryMgmtListFromDB,
  getCategoryPeriodSummaryListFromDB,
  reorderCategoryMgmtInDB,
  updateCategoryMgmtToDB,
} from "../repo/categoryMgmtRepo";
import {
  CategoryMgmtCreateReqType,
  CategoryPeriodSummaryRspType,
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
      { column: "sort_order", direction: "ASC" },
      { column: "created_at", direction: "ASC" },
      { column: "label", direction: "ASC" },
    ],
    curPage,
    pageSize,
  });

export const reorderCategoryMgmt = async (
  typeId: number,
  orderedCategoryIds: string[],
): Promise<string | void> => {
  if (!orderedCategoryIds.length) return "No categories to reorder.";
  if (new Set(orderedCategoryIds).size !== orderedCategoryIds.length)
    return "Invalid category order.";

  await reorderCategoryMgmtInDB(typeId, orderedCategoryIds);
};

export const getCategoryPeriodSummaryList = async (
  typeId: number,
  startDate: string,
  endDate: string,
  curPage: number,
  pageSize: number,
  currencyCode?: string,
): Promise<CategoryPeriodSummaryRspType[]> =>
  getCategoryPeriodSummaryListFromDB(
    {
      typeId,
      orderBy: currencyCode
        ? [
            { column: "period_total", direction: "DESC" },
            { column: "categories.label", direction: "ASC" },
          ]
        : [
            { column: "sort_order", direction: "ASC" },
            { column: "categories.label", direction: "ASC" },
          ],
      curPage,
      pageSize,
    },
    startDate,
    endDate,
    currencyCode,
  );

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
