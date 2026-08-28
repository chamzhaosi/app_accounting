import { randomUUID } from "expo-crypto";
import * as SQLite from "expo-sqlite";
import { DB_SYNC_STATUS } from "../../constants/enum";
import { toCurrencyAmountNumber } from "../../utils/amount";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { getDB } from "../db/database";
import type {
  BudgetCategoryProgressType,
  BudgetDailyRemainingType,
  BudgetManageCategoryType,
  BudgetPlanListItemType,
  BudgetRspType,
  BudgetSaveReqType,
} from "../types/budgetType";

const mapBudget = (budget: BudgetRspType | null) =>
  budget ? { ...budget, is_active: Boolean(budget.is_active) } : null;

export const getBudgetDailyRemainingFromDB = async (
  startDate: string,
  endDate: string,
  currencyCode: string,
): Promise<BudgetDailyRemainingType[]> => {
  try {
    const db = await getDB();
    const result = await db.getAllAsync<BudgetDailyRemainingType>(
      `WITH RECURSIVE dates(transaction_date) AS (
         SELECT date(?)
         UNION ALL
         SELECT date(transaction_date, '+1 day')
         FROM dates
         WHERE transaction_date < date(?)
       ), selected_plan AS (
         SELECT id
         FROM budget_plans
         WHERE currency_code = ?
           AND deleted_at IS NULL
         LIMIT 1
       ), dated_budgets AS (
         SELECT
           dates.transaction_date,
           (
             SELECT b.id
             FROM budgets b
             WHERE b.plan_id = selected_plan.id
               AND b.month <= date(dates.transaction_date, 'start of month')
               AND b.deleted_at IS NULL
             ORDER BY b.month DESC
             LIMIT 1
           ) AS budget_id
         FROM dates
         LEFT JOIN selected_plan ON 1 = 1
       )
       SELECT
         dated_budgets.transaction_date,
         CASE WHEN b.id IS NULL THEN 0 ELSE 1 END AS has_budget,
         ROUND(COALESCE(b.total_budget, 0), 3) AS total_budget,
         CASE
           WHEN b.id IS NULL OR b.is_active = 0 THEN 0
           ELSE ROUND(b.total_budget - COALESCE((
             SELECT SUM(t.converted_amount)
             FROM transactions t
             JOIN accounts a ON a.id = t.account_id
             WHERE t.transaction_type = 'expense'
               AND t.deleted_at IS NULL
               AND t.account_currency_code = ?
               AND t.transaction_date >= date(dated_budgets.transaction_date, 'start of month')
               AND t.transaction_date <= dated_budgets.transaction_date
           ), 0), 3)
         END AS remaining_amount
       FROM dated_budgets
       LEFT JOIN budgets b ON b.id = dated_budgets.budget_id
       ORDER BY dated_budgets.transaction_date ASC;`,
      [startDate, endDate, currencyCode, currencyCode],
    );
    debugLog(DEBUG_TAG.BUDGET_DB, "Loaded daily remaining budget", {
      startDate,
      endDate,
      currencyCode,
      count: result.length,
    });
    return result;
  } catch (error) {
    console.error(
      DEBUG_TAG.BUDGET_DB,
      "Error when loading daily remaining budget",
      error,
    );
    throw error;
  }
};

export const getBudgetByPlanAndMonthFromDB = async (
  planId: string,
  month: string,
) => {
  try {
    const db = await getDB();
    const budget = await db.getFirstAsync<BudgetRspType>(
      `SELECT b.id, b.plan_id, bp.currency_code, b.month,
              b.total_budget, b.is_active
       FROM budget_plans bp
       JOIN budgets b ON b.plan_id = bp.id
       WHERE bp.id = ?
         AND bp.deleted_at IS NULL
         AND b.month <= ?
         AND b.deleted_at IS NULL
       ORDER BY b.month DESC
       LIMIT 1;`,
      [planId, month],
    );
    return mapBudget(budget);
  } catch (error) {
    console.error(DEBUG_TAG.BUDGET_DB, "Error when loading plan budget", error);
    throw error;
  }
};

export const getBudgetByCurrencyAndMonthFromDB = async (
  currencyCode: string,
  month: string,
) => {
  try {
    const db = await getDB();
    const budget = await db.getFirstAsync<BudgetRspType>(
      `SELECT b.id, b.plan_id, bp.currency_code, b.month,
              b.total_budget, b.is_active
       FROM budget_plans bp
       JOIN budgets b ON b.plan_id = bp.id
       WHERE bp.currency_code = ?
         AND bp.deleted_at IS NULL
         AND b.month <= ?
         AND b.deleted_at IS NULL
       ORDER BY b.month DESC
       LIMIT 1;`,
      [currencyCode, month],
    );
    return mapBudget(budget);
  } catch (error) {
    console.error(
      DEBUG_TAG.BUDGET_DB,
      "Error when loading currency budget",
      error,
    );
    throw error;
  }
};

export const getBudgetPlanListFromDB = async (
  month: string,
): Promise<BudgetPlanListItemType[]> => {
  try {
    const db = await getDB();
    const rows = await db.getAllAsync<BudgetPlanListItemType>(
      `SELECT
         bp.id AS plan_id,
         bp.currency_code,
         b.id AS revision_id,
         b.month AS effective_month,
         b.total_budget,
         b.is_active,
         CASE WHEN cp.code IS NULL THEN 0 ELSE 1 END AS is_currency_enabled,
         (SELECT COUNT(*) FROM budget_categories bc
          WHERE bc.budget_id = b.id AND bc.deleted_at IS NULL) AS allocation_count,
         ROUND(COALESCE((SELECT SUM(bc.amount) FROM budget_categories bc
          WHERE bc.budget_id = b.id AND bc.deleted_at IS NULL), 0), 3)
          AS allocated_amount
       FROM budget_plans bp
       JOIN budgets b ON b.id = (
         SELECT latest.id
         FROM budgets latest
         WHERE latest.plan_id = bp.id
           AND latest.month <= ?
           AND latest.deleted_at IS NULL
         ORDER BY latest.month DESC
         LIMIT 1
       )
       LEFT JOIN currency_preferences cp ON cp.code = bp.currency_code
       WHERE bp.deleted_at IS NULL
       ORDER BY is_currency_enabled DESC, b.is_active DESC, bp.currency_code ASC;`,
      [month],
    );
    return rows.map((row) => ({
      ...row,
      is_active: Boolean(row.is_active),
      is_currency_enabled: Boolean(row.is_currency_enabled),
    }));
  } catch (error) {
    console.error(
      DEBUG_TAG.BUDGET_DB,
      "Error when loading budget plans",
      error,
    );
    throw error;
  }
};

export const getBudgetPlanCurrencyCodesFromDB = async () => {
  try {
    const db = await getDB();
    const rows = await db.getAllAsync<{ currency_code: string }>(
      `SELECT currency_code FROM budget_plans
       WHERE deleted_at IS NULL ORDER BY currency_code ASC;`,
    );
    return rows.map(({ currency_code }) => currency_code);
  } catch (error) {
    console.error(
      DEBUG_TAG.BUDGET_DB,
      "Error when loading budget plan currencies",
      error,
    );
    throw error;
  }
};

export const getBudgetCategoryProgressFromDB = async (
  budgetId: string,
  month: string,
  currencyCode: string,
): Promise<BudgetCategoryProgressType[]> => {
  try {
    const db = await getDB();
    const result = await db.getAllAsync<BudgetCategoryProgressType>(
      `WITH category_spending AS (
         SELECT t.category_id, ROUND(SUM(t.converted_amount), 3) AS spent_amount
         FROM transactions t
         JOIN accounts a ON a.id = t.account_id
         WHERE t.transaction_type = 'expense'
           AND t.deleted_at IS NULL
           AND t.account_currency_code = ?
           AND t.transaction_date >= ?
           AND t.transaction_date < date(?, '+1 month')
         GROUP BY t.category_id
       )
       SELECT
         COALESCE(bc.id, 'unallocated:' || c.id) AS allocation_id,
         c.id AS category_id,
         c.label,
         c.translation_key,
         c.icon,
         COALESCE(bc.amount, 0) AS allocated_amount,
         COALESCE(category_spending.spent_amount, 0) AS spent_amount
       FROM categories c
       LEFT JOIN budget_categories bc
         ON bc.category_id = c.id
        AND bc.budget_id = ?
        AND bc.deleted_at IS NULL
       LEFT JOIN category_spending
         ON category_spending.category_id = c.id
       WHERE c.type_id = 2
         AND (bc.id IS NOT NULL OR category_spending.spent_amount > 0)
       ORDER BY spent_amount DESC, c.label ASC;`,
      [currencyCode, month, month, budgetId],
    );
    debugLog(DEBUG_TAG.BUDGET_DB, "Loaded budget category progress", {
      budgetId,
      currencyCode,
      count: result.length,
    });
    return result;
  } catch (error) {
    console.error(
      DEBUG_TAG.BUDGET_DB,
      "Error when loading budget progress",
      error,
    );
    throw error;
  }
};

export const getBudgetManageCategoriesFromDB = async (
  budgetId?: string,
): Promise<BudgetManageCategoryType[]> => {
  try {
    const db = await getDB();
    return await db.getAllAsync<BudgetManageCategoryType>(
      `SELECT c.id AS category_id, c.label, c.translation_key, c.icon,
              bc.id AS allocation_id, COALESCE(bc.amount, 0) AS amount
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
  } catch (error) {
    console.error(
      DEBUG_TAG.BUDGET_DB,
      "Error when loading budget management categories",
      error,
    );
    throw error;
  }
};

export const getMonthExpenseTotalFromDB = async (
  month: string,
  currencyCode: string,
): Promise<number> => {
  try {
    const db = await getDB();
    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT ROUND(COALESCE(SUM(t.converted_amount), 0), 3) AS total
       FROM transactions t
       JOIN accounts a ON a.id = t.account_id
       WHERE t.transaction_type = 'expense'
         AND t.deleted_at IS NULL
         AND t.account_currency_code = ?
         AND t.transaction_date >= ?
         AND t.transaction_date < date(?, '+1 month');`,
      [currencyCode, month, month],
    );
    return result?.total ?? 0;
  } catch (error) {
    console.error(
      DEBUG_TAG.BUDGET_DB,
      "Error when loading month expenses",
      error,
    );
    throw error;
  }
};

const saveAllocations = async (
  db: SQLite.SQLiteDatabase,
  budgetId: string,
  currencyCode: string,
  allocations: BudgetSaveReqType["allocations"],
) => {
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
    allocations.map((item) => item.categoryId),
  );

  for (const allocation of allocations) {
    const allocationId = existingByCategory.get(allocation.categoryId);
    const amount = toCurrencyAmountNumber(allocation.amount, currencyCode);
    if (allocationId) {
      await db.runAsync(
        `UPDATE budget_categories
         SET amount = ?, deleted_at = NULL, sync_status = ?, updated_at = datetime('now')
         WHERE id = ?;`,
        [amount, DB_SYNC_STATUS.PENDING, allocationId],
      );
    } else {
      await db.runAsync(
        `INSERT INTO budget_categories (id, budget_id, category_id, amount)
         VALUES (?, ?, ?, ?);`,
        [randomUUID(), budgetId, allocation.categoryId, amount],
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
};

export const saveBudgetToDB = async (data: BudgetSaveReqType) => {
  try {
    const db = await getDB();
    const totalBudget = toCurrencyAmountNumber(
      data.totalBudget,
      data.currencyCode,
    );
    let planId = data.planId;

    await db.withTransactionAsync(async () => {
      if (!planId) {
        planId = randomUUID();
        await db.runAsync(
          `INSERT INTO budget_plans (id, currency_code) VALUES (?, ?);`,
          [planId, data.currencyCode],
        );
      }

      const existingRevision = await db.getFirstAsync<{ id: string }>(
        `SELECT id FROM budgets
         WHERE plan_id = ? AND month = ? AND deleted_at IS NULL;`,
        [planId, data.effectiveMonth],
      );
      const budgetId = existingRevision?.id ?? randomUUID();

      if (existingRevision) {
        await db.runAsync(
          `UPDATE budgets
           SET total_budget = ?, is_active = ?, sync_status = ?, updated_at = datetime('now')
           WHERE id = ?;`,
          [
            totalBudget,
            data.isActive ? 1 : 0,
            DB_SYNC_STATUS.PENDING,
            budgetId,
          ],
        );
      } else {
        await db.runAsync(
          `INSERT INTO budgets (id, plan_id, month, total_budget, is_active)
           VALUES (?, ?, ?, ?, ?);`,
          [
            budgetId,
            planId,
            data.effectiveMonth,
            totalBudget,
            data.isActive ? 1 : 0,
          ],
        );
      }

      await saveAllocations(db, budgetId, data.currencyCode, data.allocations);
    });

    debugLog(DEBUG_TAG.BUDGET_DB, "Saved budget revision", {
      planId,
      currencyCode: data.currencyCode,
      effectiveMonth: data.effectiveMonth,
      allocationCount: data.allocations.length,
    });
    return planId;
  } catch (error) {
    console.error(DEBUG_TAG.BUDGET_DB, "Error when saving budget", error);
    throw error;
  }
};

export const deactivateBudgetsForCurrenciesWithDB = async (
  db: SQLite.SQLiteDatabase,
  currencyCodes: string[],
  effectiveMonth: string,
) => {
  for (const currencyCode of currencyCodes) {
    const latest = await db.getFirstAsync<BudgetRspType>(
      `SELECT b.id, b.plan_id, bp.currency_code, b.month,
              b.total_budget, b.is_active
       FROM budget_plans bp
       JOIN budgets b ON b.plan_id = bp.id
       WHERE bp.currency_code = ?
         AND bp.deleted_at IS NULL
         AND b.month <= ?
         AND b.deleted_at IS NULL
       ORDER BY b.month DESC
       LIMIT 1;`,
      [currencyCode, effectiveMonth],
    );
    if (!latest || !latest.is_active) continue;

    if (latest.month === effectiveMonth) {
      await db.runAsync(
        `UPDATE budgets
         SET is_active = 0, sync_status = ?, updated_at = datetime('now')
         WHERE id = ?;`,
        [DB_SYNC_STATUS.PENDING, latest.id],
      );
      continue;
    }

    const revisionId = randomUUID();
    await db.runAsync(
      `INSERT INTO budgets (id, plan_id, month, total_budget, is_active)
       VALUES (?, ?, ?, ?, 0);`,
      [revisionId, latest.plan_id, effectiveMonth, latest.total_budget],
    );
    const allocations = await db.getAllAsync<{
      category_id: string;
      amount: number;
    }>(
      `SELECT category_id, amount FROM budget_categories
       WHERE budget_id = ? AND deleted_at IS NULL;`,
      [latest.id],
    );
    for (const allocation of allocations) {
      await db.runAsync(
        `INSERT INTO budget_categories (id, budget_id, category_id, amount)
         VALUES (?, ?, ?, ?);`,
        [randomUUID(), revisionId, allocation.category_id, allocation.amount],
      );
    }
  }
};
