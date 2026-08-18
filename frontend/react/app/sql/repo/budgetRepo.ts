import { randomUUID } from "expo-crypto";
import { DB_SYNC_STATUS } from "../../constants/enum";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { getDB } from "../db/database";
import type {
  BudgetCategoryProgressType,
  BudgetManageCategoryType,
  BudgetRspType,
  BudgetSaveReqType,
} from "../types/budgetType";

export const getBudgetByMonthFromDB = async (
  month: string,
): Promise<BudgetRspType | null> => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<BudgetRspType>(
      `SELECT id, month, total_budget, is_active
       FROM budgets
       WHERE month = ? AND deleted_at IS NULL;`,
      [month],
    );
    return result ? { ...result, is_active: Boolean(result.is_active) } : null;
  } catch (e) {
    console.error(DEBUG_TAG.BUDGET_DB, "Error when loading month budget", e);
    throw e;
  }
};

export const getBudgetCategoryProgressFromDB = async (
  budgetId: string,
  month: string,
): Promise<BudgetCategoryProgressType[]> => {
  try {
    const db = await getDB();
    const result = await db.getAllAsync<BudgetCategoryProgressType>(
      `SELECT
         bc.id AS allocation_id,
         c.id AS category_id,
         c.label,
         c.icon,
         bc.amount AS allocated_amount,
         COALESCE(SUM(t.amount), 0) AS spent_amount
       FROM budget_categories bc
       JOIN categories c ON c.id = bc.category_id
       LEFT JOIN transactions t
         ON t.category_id = c.id
        AND t.transaction_type = 'expense'
        AND t.deleted_at IS NULL
        AND t.transaction_date >= ?
        AND t.transaction_date < date(?, '+1 month')
       WHERE bc.budget_id = ? AND bc.deleted_at IS NULL
       GROUP BY bc.id, c.id, c.label, c.icon, bc.amount
       ORDER BY spent_amount DESC, c.label ASC;`,
      [month, month, budgetId],
    );
    debugLog(DEBUG_TAG.BUDGET_DB, "Loaded budget category progress", {
      budgetId,
      count: result.length,
    });
    return result;
  } catch (e) {
    console.error(DEBUG_TAG.BUDGET_DB, "Error when loading budget progress", e);
    throw e;
  }
};

export const getBudgetManageCategoriesFromDB = async (
  budgetId?: string,
): Promise<BudgetManageCategoryType[]> => {
  try {
    const db = await getDB();
    return await db.getAllAsync<BudgetManageCategoryType>(
      `SELECT
         c.id AS category_id,
         c.label,
         c.icon,
         bc.id AS allocation_id,
         COALESCE(bc.amount, 0) AS amount
       FROM categories c
       LEFT JOIN budget_categories bc
         ON bc.category_id = c.id
        AND bc.budget_id = ?
        AND bc.deleted_at IS NULL
       WHERE c.type_id = 2
         AND c.is_active = 1
         AND c.deleted_at IS NULL
       ORDER BY c.label ASC;`,
      [budgetId ?? null],
    );
  } catch (e) {
    console.error(
      DEBUG_TAG.BUDGET_DB,
      "Error when loading budget management categories",
      e,
    );
    throw e;
  }
};

export const getMonthExpenseTotalFromDB = async (
  month: string,
): Promise<number> => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM transactions
       WHERE transaction_type = 'expense'
         AND deleted_at IS NULL
         AND transaction_date >= ?
         AND transaction_date < date(?, '+1 month');`,
      [month, month],
    );
    return result?.total ?? 0;
  } catch (e) {
    console.error(DEBUG_TAG.BUDGET_DB, "Error when loading month expenses", e);
    throw e;
  }
};

export const rolloverBudgetFromLatestToDB = async (
  month: string,
): Promise<boolean> => {
  try {
    const db = await getDB();
    let created = false;
    await db.withTransactionAsync(async () => {
      const current = await db.getFirstAsync<{ id: string }>(
        "SELECT id FROM budgets WHERE month = ? AND deleted_at IS NULL;",
        [month],
      );
      if (current) return;

      const latest = await db.getFirstAsync<BudgetRspType>(
        `SELECT id, month, total_budget, is_active
         FROM budgets
         WHERE month < ? AND deleted_at IS NULL
         ORDER BY month DESC
         LIMIT 1;`,
        [month],
      );
      if (!latest || !latest.is_active) return;

      const budgetId = randomUUID();
      await db.runAsync(
        `INSERT INTO budgets (id, month, total_budget, is_active)
         VALUES (?, ?, ?, 1);`,
        [budgetId, month, latest.total_budget],
      );
      const allocations = await db.getAllAsync<{
        category_id: string;
        amount: number;
      }>(
        `SELECT bc.category_id, bc.amount
         FROM budget_categories bc
         JOIN categories c ON c.id = bc.category_id
         WHERE bc.budget_id = ?
           AND bc.deleted_at IS NULL
           AND c.is_active = 1
           AND c.deleted_at IS NULL;`,
        [latest.id],
      );
      for (const allocation of allocations) {
        await db.runAsync(
          `INSERT INTO budget_categories (id, budget_id, category_id, amount)
           VALUES (?, ?, ?, ?);`,
          [randomUUID(), budgetId, allocation.category_id, allocation.amount],
        );
      }
      created = true;
    });
    if (created)
      debugLog(DEBUG_TAG.BUDGET_DB, "Rolled budget into new month", { month });
    return created;
  } catch (e) {
    console.error(DEBUG_TAG.BUDGET_DB, "Error when rolling over budget", e);
    throw e;
  }
};

export const saveBudgetToDB = async (data: BudgetSaveReqType) => {
  try {
    const db = await getDB();
    await db.withTransactionAsync(async () => {
      const existingBudget = await db.getFirstAsync<BudgetRspType>(
        "SELECT id, month, total_budget, is_active FROM budgets WHERE month = ? AND deleted_at IS NULL;",
        [data.month],
      );
      const budgetId = existingBudget?.id ?? randomUUID();

      if (existingBudget) {
        await db.runAsync(
          `UPDATE budgets
           SET total_budget = ?, is_active = ?, sync_status = ?, updated_at = datetime('now')
           WHERE id = ?;`,
          [
            data.totalBudget,
            data.isActive ? 1 : 0,
            DB_SYNC_STATUS.PENDING,
            budgetId,
          ],
        );
      } else {
        await db.runAsync(
          `INSERT INTO budgets (id, month, total_budget, is_active)
           VALUES (?, ?, ?, ?);`,
          [budgetId, data.month, data.totalBudget, data.isActive ? 1 : 0],
        );
      }

      const existingAllocations = await db.getAllAsync<{
        id: string;
        category_id: string;
      }>(
        `SELECT id, category_id FROM budget_categories
         WHERE budget_id = ? AND deleted_at IS NULL;`,
        [budgetId],
      );
      const existingByCategory = new Map(
        existingAllocations.map((item) => [item.category_id, item.id]),
      );
      const submittedCategoryIds = new Set(
        data.allocations.map((item) => item.categoryId),
      );

      for (const allocation of data.allocations) {
        const allocationId = existingByCategory.get(allocation.categoryId);
        if (allocationId) {
          await db.runAsync(
            `UPDATE budget_categories
             SET amount = ?, sync_status = ?, updated_at = datetime('now')
             WHERE id = ?;`,
            [allocation.amount, DB_SYNC_STATUS.PENDING, allocationId],
          );
        } else {
          await db.runAsync(
            `INSERT INTO budget_categories (id, budget_id, category_id, amount)
             VALUES (?, ?, ?, ?);`,
            [randomUUID(), budgetId, allocation.categoryId, allocation.amount],
          );
        }
      }

      for (const allocation of existingAllocations) {
        if (submittedCategoryIds.has(allocation.category_id)) continue;
        await db.runAsync(
          `UPDATE budget_categories
           SET deleted_at = datetime('now'), sync_status = ?, updated_at = datetime('now')
           WHERE id = ?;`,
          [DB_SYNC_STATUS.PENDING, allocation.id],
        );
      }
    });
    debugLog(DEBUG_TAG.BUDGET_DB, "Saved month budget", {
      month: data.month,
      allocationCount: data.allocations.length,
    });
  } catch (e) {
    console.error(DEBUG_TAG.BUDGET_DB, "Error when saving month budget", e);
    throw e;
  }
};
