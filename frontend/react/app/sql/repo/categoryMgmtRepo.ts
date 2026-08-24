import { randomUUID } from "expo-crypto";
import { DB_SYNC_STATUS } from "../../constants/enum";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import {
  buildOrderBy,
  DEFAULT_CURRENT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "../db/common";
import { getDB } from "../db/database";
import {
  CategoryMgmtCreateReqType,
  CategoryPeriodSummaryRspType,
  CategoryMgmtRspType,
  CategoryMgmtUpdateReqType,
} from "../types/categoryMgmtType";
import { SQLQueryOptions } from "../types/common";

type CategoryListQueryOptions = SQLQueryOptions & {
  typeId: number;
};

export const getCategoryMgmtListFromDB = async ({
  typeId,
  orderBy,
  pageSize = DEFAULT_PAGE_SIZE,
  curPage = DEFAULT_CURRENT_PAGE,
}: CategoryListQueryOptions): Promise<CategoryMgmtRspType[]> => {
  try {
    const offset = (curPage - 1) * pageSize;
    const db = await getDB();
    const result = await db.getAllAsync<CategoryMgmtRspType>(
      `
        SELECT *
        FROM categories
        WHERE type_id = ?
          AND deleted_at IS NULL
        ${buildOrderBy(orderBy)}
        LIMIT ? OFFSET ?;
      `,
      [typeId, pageSize, offset],
    );
    debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT_DB, "Loaded category page", {
      typeId,
      curPage,
      pageSize,
      count: result.length,
    });

    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.CATEGORY_MANAGEMENT_DB,
      "Error when getting category list from db",
      e,
    );
    throw e;
  }
};

export const getCategoryPeriodSummaryListFromDB = async (
  {
    typeId,
    orderBy,
    pageSize = DEFAULT_PAGE_SIZE,
    curPage = DEFAULT_CURRENT_PAGE,
  }: CategoryListQueryOptions,
  startDate: string,
  endDate: string,
): Promise<CategoryPeriodSummaryRspType[]> => {
  try {
    const offset = (curPage - 1) * pageSize;
    const db = await getDB();
    const result = await db.getAllAsync<CategoryPeriodSummaryRspType>(
      `
        SELECT
          categories.*,
          ROUND(SUM(transactions.amount), 2) AS period_total,
          COUNT(transactions.id) AS transaction_count
        FROM categories
        INNER JOIN transactions
          ON transactions.category_id = categories.id
          AND transactions.transaction_date >= ?
          AND transactions.transaction_date <= ?
          AND transactions.deleted_at IS NULL
        WHERE categories.type_id = ?
          AND categories.deleted_at IS NULL
        GROUP BY categories.id
        ${buildOrderBy(orderBy)}
        LIMIT ? OFFSET ?;
      `,
      [startDate, endDate, typeId, pageSize, offset],
    );
    debugLog(
      DEBUG_TAG.CATEGORY_MANAGEMENT_DB,
      "Loaded category period summary page",
      {
        typeId,
        startDate,
        endDate,
        curPage,
        pageSize,
        count: result.length,
      },
    );

    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.CATEGORY_MANAGEMENT_DB,
      "Error when getting category period summary list from db",
      e,
    );
    throw e;
  }
};

export const getCategoryMgmtByTypeAndLabelFromDB = async (
  typeId: number,
  label: string,
): Promise<CategoryMgmtRspType | null> => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<CategoryMgmtRspType>(
      `
        SELECT *
        FROM categories
        WHERE type_id = ?
          AND label = ? COLLATE NOCASE
          AND deleted_at IS NULL;
      `,
      [typeId, label],
    );
    debugLog(
      DEBUG_TAG.CATEGORY_MANAGEMENT_DB,
      "Checked category type and label",
      { typeId, label, found: Boolean(result) },
    );

    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.CATEGORY_MANAGEMENT_DB,
      "Error when checking category type and label from db",
      e,
    );
    throw e;
  }
};

export const getCategoryMgmtByIdFromDB = async (
  id: string,
): Promise<CategoryMgmtRspType | null> => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<CategoryMgmtRspType>(
      `SELECT * FROM categories WHERE id = ? AND deleted_at IS NULL;`,
      [id],
    );
    debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT_DB, "Loaded category by id", {
      id,
      found: Boolean(result),
    });

    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.CATEGORY_MANAGEMENT_DB,
      "Error when getting category by id from db",
      e,
    );
    throw e;
  }
};

export const createNewCategoryMgmtToDB = async (
  data: CategoryMgmtCreateReqType,
) => {
  try {
    const db = await getDB();
    const id = randomUUID();
    await db.runAsync(
      `
        INSERT INTO categories (
          id,
          type_id,
          label,
          icon,
          descriptions,
          sort_order
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          (
            SELECT COALESCE(MAX(sort_order), -1) + 1
            FROM categories
            WHERE type_id = ?
              AND deleted_at IS NULL
          )
        );
      `,
      [
        id,
        data.typeId,
        data.label,
        data.icon,
        data.descriptions || null,
        data.typeId,
      ],
    );
    debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT_DB, "Created category", {
      id,
      typeId: data.typeId,
      label: data.label,
    });
  } catch (e) {
    console.error(
      DEBUG_TAG.CATEGORY_MANAGEMENT_DB,
      "Error when creating category in db",
      e,
    );
    throw e;
  }
};

export const reorderCategoryMgmtInDB = async (
  typeId: number,
  orderedCategoryIds: string[],
) => {
  try {
    const db = await getDB();
    await db.withTransactionAsync(async () => {
      for (const [sortOrder, id] of orderedCategoryIds.entries()) {
        await db.runAsync(
          `
            UPDATE categories
            SET
              sort_order = ?,
              sync_status = ?,
              updated_at = datetime('now')
            WHERE id = ?
              AND type_id = ?
              AND deleted_at IS NULL;
          `,
          [sortOrder, DB_SYNC_STATUS.PENDING, id, typeId],
        );
      }
    });
    debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT_DB, "Reordered categories", {
      typeId,
      count: orderedCategoryIds.length,
    });
  } catch (e) {
    console.error(
      DEBUG_TAG.CATEGORY_MANAGEMENT_DB,
      "Error when reordering categories in db",
      e,
    );
    throw e;
  }
};

export const updateCategoryMgmtToDB = async (
  data: CategoryMgmtUpdateReqType,
) => {
  try {
    const db = await getDB();
    await db.runAsync(
      `
        UPDATE categories
        SET
          translation_key = CASE
            WHEN ? = 1 THEN NULL
            ELSE translation_key
          END,
          sort_order = CASE
            WHEN type_id <> ? THEN (
              SELECT COALESCE(MAX(sort_order), -1) + 1
              FROM categories
              WHERE type_id = ?
                AND deleted_at IS NULL
            )
            ELSE sort_order
          END,
          type_id = ?,
          label = ?,
          icon = ?,
          descriptions = ?,
          sync_status = ?,
          updated_at = datetime('now')
        WHERE id = ?
          AND deleted_at IS NULL
          AND is_system = 0;
      `,
      [
        data.isLabelCustomized ? 1 : 0,
        data.typeId,
        data.typeId,
        data.typeId,
        data.label,
        data.icon,
        data.descriptions || null,
        DB_SYNC_STATUS.PENDING,
        data.id,
      ],
    );
    debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT_DB, "Updated category", {
      id: data.id,
      typeId: data.typeId,
      label: data.label,
    });
  } catch (e) {
    console.error(
      DEBUG_TAG.CATEGORY_MANAGEMENT_DB,
      "Error when updating category in db",
      e,
    );
    throw e;
  }
};

export const deleteCategoryMgmtFromDB = async (id: string) => {
  try {
    const db = await getDB();
    await db.runAsync(
      `
        UPDATE categories
        SET
          deleted_at = datetime('now'),
          sync_status = ?,
          is_active = 0,
          updated_at = datetime('now')
        WHERE id = ?
          AND deleted_at IS NULL
          AND is_system = 0;
      `,
      [DB_SYNC_STATUS.PENDING, id],
    );
    debugLog(DEBUG_TAG.CATEGORY_MANAGEMENT_DB, "Deleted category", { id });
  } catch (e) {
    console.error(
      DEBUG_TAG.CATEGORY_MANAGEMENT_DB,
      "Error when deleting category from db",
      e,
    );
    throw e;
  }
};
