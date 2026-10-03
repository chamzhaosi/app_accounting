import { randomUUID } from "expo-crypto";
import * as SQLite from "expo-sqlite";
import { DB_SYNC_STATUS } from "../../constants/enum";
import { toCurrencyAmountNumber } from "../../utils/amount";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { getDB } from "../db/database";
import type {
  BudgetCategoryProgressType,
  BudgetBeneficiaryAllocationType,
  BudgetDailyRemainingType,
  BudgetManageCategoryType,
  BudgetPlanListItemType,
  BudgetRspType,
  BudgetSaveReqType,
} from "../types/budgetType";
import { getRequiredActiveBookId } from "../../stores/useBookStore";

const mapBudget = (budget: BudgetRspType | null) =>
  budget ? { ...budget, is_active: Boolean(budget.is_active) } : null;

export const getBudgetDailyRemainingFromDB = async (
  startDate: string,
  endDate: string,
  currencyCode: string,
): Promise<BudgetDailyRemainingType[]> => {
  try {
    const db = await getDB();
    const bookId = getRequiredActiveBookId();
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
           AND book_id = ?
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
               AND t.book_id = ?
               AND t.deleted_at IS NULL
               AND t.account_currency_code = ?
               AND t.transaction_date >= date(dated_budgets.transaction_date, 'start of month')
               AND t.transaction_date <= dated_budgets.transaction_date
           ), 0), 3)
         END AS remaining_amount
       FROM dated_budgets
       LEFT JOIN budgets b ON b.id = dated_budgets.budget_id
       ORDER BY dated_budgets.transaction_date ASC;`,
      [startDate, endDate, currencyCode, bookId, bookId, currencyCode],
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
    const bookId = getRequiredActiveBookId();
    const budget = await db.getFirstAsync<BudgetRspType>(
      `SELECT b.id, b.book_id, b.plan_id, bp.currency_code, b.month,
              b.total_budget, b.is_active
       FROM budget_plans bp
       JOIN budgets b ON b.plan_id = bp.id
       WHERE bp.id = ?
         AND bp.book_id = ?
         AND b.book_id = bp.book_id
         AND bp.deleted_at IS NULL
         AND b.month <= ?
         AND b.deleted_at IS NULL
       ORDER BY b.month DESC
       LIMIT 1;`,
      [planId, bookId, month],
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
    const bookId = getRequiredActiveBookId();
    const budget = await db.getFirstAsync<BudgetRspType>(
      `SELECT b.id, b.book_id, b.plan_id, bp.currency_code, b.month,
              b.total_budget, b.is_active
       FROM budget_plans bp
       JOIN budgets b ON b.plan_id = bp.id
       WHERE bp.currency_code = ?
         AND bp.book_id = ?
         AND b.book_id = bp.book_id
         AND bp.deleted_at IS NULL
         AND b.month <= ?
         AND b.deleted_at IS NULL
       ORDER BY b.month DESC
       LIMIT 1;`,
      [currencyCode, bookId, month],
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
    const bookId = getRequiredActiveBookId();
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
       LEFT JOIN currency_preferences cp
         ON cp.code = bp.currency_code AND cp.book_id = bp.book_id
       WHERE bp.deleted_at IS NULL
         AND bp.book_id = ?
         AND b.book_id = bp.book_id
       ORDER BY is_currency_enabled DESC, b.is_active DESC, bp.currency_code ASC;`,
      [month, bookId],
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
    const bookId = getRequiredActiveBookId();
    const rows = await db.getAllAsync<{ currency_code: string }>(
      `SELECT currency_code FROM budget_plans
       WHERE deleted_at IS NULL AND book_id = ? ORDER BY currency_code ASC;`,
      [bookId],
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
    const bookId = getRequiredActiveBookId();
    const result = await db.getAllAsync<BudgetCategoryProgressType>(
      `WITH category_spending AS (
         SELECT t.category_id, ROUND(SUM(t.converted_amount), 3) AS spent_amount
         FROM transactions t
         JOIN accounts a ON a.id = t.account_id
         WHERE t.transaction_type = 'expense'
           AND t.book_id = ?
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
        AND bc.book_id = c.book_id
        AND bc.budget_id = ?
        AND bc.deleted_at IS NULL
       LEFT JOIN category_spending
         ON category_spending.category_id = c.id
       WHERE c.type_id = 2
         AND c.book_id = ?
         AND (bc.id IS NOT NULL OR category_spending.spent_amount > 0)
       ORDER BY spent_amount DESC, c.label ASC;`,
      [bookId, currencyCode, month, month, budgetId, bookId],
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

export const getFilteredBudgetCategoryProgressFromDB = async (
  budgetId: string,
  month: string,
  currencyCode: string,
  beneficiaryIds: string[],
): Promise<BudgetCategoryProgressType[]> => {
  if (!beneficiaryIds.length)
    return getBudgetCategoryProgressFromDB(budgetId, month, currencyCode);
  try {
    const db = await getDB();
    const placeholders = beneficiaryIds.map(() => "?").join(", ");
    return await db.getAllAsync<BudgetCategoryProgressType>(
      `WITH selected_spending AS (
         SELECT t.category_id, ROUND(SUM(t.converted_amount), 3) AS spent_amount
         FROM transactions t
         WHERE t.transaction_type = 'expense'
           AND t.deleted_at IS NULL
           AND t.account_currency_code = ?
           AND t.transaction_date >= ?
           AND t.transaction_date < date(?, '+1 month')
           AND t.beneficiary_id IN (${placeholders})
         GROUP BY t.category_id
       ), selected_allocations AS (
         SELECT bc.category_id,
                ROUND(SUM(bba.amount), 3) AS allocated_amount,
                COUNT(DISTINCT bba.beneficiary_id) AS allocated_count
         FROM budget_categories bc
         JOIN budget_beneficiary_allocations bba
           ON bba.budget_category_id = bc.id
          AND bba.deleted_at IS NULL
         WHERE bc.budget_id = ?
           AND bc.deleted_at IS NULL
           AND bba.beneficiary_id IN (${placeholders})
         GROUP BY bc.category_id
       )
       SELECT
         'beneficiary-filter:' || c.id AS allocation_id,
         c.id AS category_id,
         c.label,
         c.translation_key,
         c.icon,
         COALESCE(selected_allocations.allocated_amount, 0) AS allocated_amount,
         COALESCE(selected_spending.spent_amount, 0) AS spent_amount,
         CASE
           WHEN COALESCE(selected_allocations.allocated_count, 0) = 0 THEN 'none'
           WHEN selected_allocations.allocated_count < ? THEN 'partial'
           ELSE 'full'
         END AS beneficiary_allocation_status
       FROM categories c
       LEFT JOIN selected_spending ON selected_spending.category_id = c.id
       LEFT JOIN selected_allocations ON selected_allocations.category_id = c.id
       WHERE c.type_id = 2
         AND (selected_spending.spent_amount > 0 OR selected_allocations.allocated_amount > 0)
       ORDER BY spent_amount DESC, c.label ASC;`,
      [
        currencyCode,
        month,
        month,
        ...beneficiaryIds,
        budgetId,
        ...beneficiaryIds,
        beneficiaryIds.length,
      ],
    );
  } catch (error) {
    console.error(
      DEBUG_TAG.BUDGET_DB,
      "Unable to load filtered budget progress",
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
    const bookId = getRequiredActiveBookId();
    const categories = await db.getAllAsync<
      Omit<BudgetManageCategoryType, "beneficiary_allocations">
    >(
      `SELECT c.id AS category_id, c.label, c.translation_key, c.icon,
              bc.id AS allocation_id, COALESCE(bc.amount, 0) AS amount
       FROM categories c
       LEFT JOIN budget_categories bc
         ON bc.category_id = c.id
        AND bc.book_id = c.book_id
        AND bc.budget_id = ?
        AND bc.deleted_at IS NULL
       WHERE c.type_id = 2
         AND c.book_id = ?
         AND c.is_active = 1
         AND c.deleted_at IS NULL
       ORDER BY c.label ASC;`,
      [budgetId ?? null, bookId],
    );
    if (!budgetId)
      return categories.map((category) => ({
        ...category,
        beneficiary_allocations: [],
      }));
    const allocations = await db.getAllAsync<
      BudgetBeneficiaryAllocationType & { category_id: string }
    >(
      `SELECT bba.id AS allocation_id, bc.category_id,
              bba.beneficiary_id, beneficiary.name AS beneficiary_name,
              beneficiary.icon AS beneficiary_icon,
              beneficiary.type AS beneficiary_type, bba.amount
       FROM budget_beneficiary_allocations bba
       JOIN budget_categories bc ON bc.id = bba.budget_category_id
       JOIN beneficiaries beneficiary ON beneficiary.id = bba.beneficiary_id
       WHERE bc.budget_id = ?
         AND bc.deleted_at IS NULL
         AND bba.deleted_at IS NULL
         AND beneficiary.is_active = 1
         AND beneficiary.deleted_at IS NULL
       ORDER BY beneficiary.name COLLATE NOCASE ASC;`,
      [budgetId],
    );
    return categories.map((category) => ({
      ...category,
      beneficiary_allocations: allocations.filter(
        (allocation) => allocation.category_id === category.category_id,
      ),
    }));
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
    const bookId = getRequiredActiveBookId();
    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT ROUND(COALESCE(SUM(t.converted_amount), 0), 3) AS total
       FROM transactions t
       JOIN accounts a ON a.id = t.account_id
       WHERE t.transaction_type = 'expense'
         AND t.book_id = ?
         AND t.deleted_at IS NULL
         AND t.account_currency_code = ?
         AND t.transaction_date >= ?
         AND t.transaction_date < date(?, '+1 month');`,
      [bookId, currencyCode, month, month],
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
  bookId: string,
) => {
  const existingAllocations = await db.getAllAsync<{
    id: string;
    category_id: string;
  }>(
    `SELECT id, category_id FROM budget_categories
     WHERE budget_id = ? AND book_id = ? AND deleted_at IS NULL;`,
    [budgetId, bookId],
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
         WHERE id = ? AND book_id = ?;`,
        [amount, DB_SYNC_STATUS.PENDING, allocationId, bookId],
      );
    } else {
      await db.runAsync(
        `INSERT INTO budget_categories (id, book_id, budget_id, category_id, amount)
         VALUES (?, ?, ?, ?, ?);`,
        [randomUUID(), bookId, budgetId, allocation.categoryId, amount],
      );
    }
    const savedCategoryAllocationId =
      allocationId ??
      (
        await db.getFirstAsync<{ id: string }>(
          `SELECT id FROM budget_categories
       WHERE budget_id = ? AND category_id = ? AND deleted_at IS NULL;`,
          [budgetId, allocation.categoryId],
        )
      )?.id;
    if (!savedCategoryAllocationId)
      throw new Error(
        `Budget category allocation is unavailable: ${allocation.categoryId}`,
      );
    const existingBeneficiaryAllocations = await db.getAllAsync<{
      id: string;
      beneficiary_id: string;
    }>(
      `SELECT id, beneficiary_id FROM budget_beneficiary_allocations
       WHERE budget_category_id = ? AND deleted_at IS NULL;`,
      [savedCategoryAllocationId],
    );
    const existingByBeneficiary = new Map(
      existingBeneficiaryAllocations.map((item) => [
        item.beneficiary_id,
        item.id,
      ]),
    );
    const submittedBeneficiaryIds = new Set(
      allocation.beneficiaryAllocations.map((item) => item.beneficiaryId),
    );
    for (const beneficiaryAllocation of allocation.beneficiaryAllocations) {
      const existingId = existingByBeneficiary.get(
        beneficiaryAllocation.beneficiaryId,
      );
      const beneficiaryAmount = toCurrencyAmountNumber(
        beneficiaryAllocation.amount,
        currencyCode,
      );
      if (existingId) {
        await db.runAsync(
          `UPDATE budget_beneficiary_allocations
           SET amount = ?, sync_status = ?, updated_at = datetime('now')
           WHERE id = ?;`,
          [beneficiaryAmount, DB_SYNC_STATUS.PENDING, existingId],
        );
      } else {
        await db.runAsync(
          `INSERT INTO budget_beneficiary_allocations (
             id, budget_category_id, beneficiary_id, amount
           ) VALUES (?, ?, ?, ?);`,
          [
            randomUUID(),
            savedCategoryAllocationId,
            beneficiaryAllocation.beneficiaryId,
            beneficiaryAmount,
          ],
        );
      }
    }
    for (const existing of existingBeneficiaryAllocations) {
      if (submittedBeneficiaryIds.has(existing.beneficiary_id)) continue;
      await db.runAsync(
        `UPDATE budget_beneficiary_allocations
         SET deleted_at = datetime('now'), sync_status = ?, updated_at = datetime('now')
         WHERE id = ?;`,
        [DB_SYNC_STATUS.PENDING, existing.id],
      );
    }
  }

  for (const allocation of existingAllocations) {
    if (submittedCategoryIds.has(allocation.category_id)) continue;
    await db.runAsync(
      `UPDATE budget_beneficiary_allocations
       SET deleted_at = datetime('now'), sync_status = ?, updated_at = datetime('now')
       WHERE budget_category_id = ? AND deleted_at IS NULL;`,
      [DB_SYNC_STATUS.PENDING, allocation.id],
    );
    await db.runAsync(
      `UPDATE budget_categories
       SET deleted_at = datetime('now'), sync_status = ?, updated_at = datetime('now')
       WHERE id = ? AND book_id = ?;`,
      [DB_SYNC_STATUS.PENDING, allocation.id, bookId],
    );
  }
};

export const saveBudgetToDB = async (data: BudgetSaveReqType) => {
  try {
    const db = await getDB();
    const bookId = getRequiredActiveBookId();
    const totalBudget = toCurrencyAmountNumber(
      data.totalBudget,
      data.currencyCode,
    );
    let planId = data.planId;

    await db.withTransactionAsync(async () => {
      if (!planId) {
        planId = randomUUID();
        await db.runAsync(
          `INSERT INTO budget_plans (id, book_id, currency_code) VALUES (?, ?, ?);`,
          [planId, bookId, data.currencyCode],
        );
      }

      const existingRevision = await db.getFirstAsync<{ id: string }>(
        `SELECT id FROM budgets
         WHERE plan_id = ? AND book_id = ? AND month = ? AND deleted_at IS NULL;`,
        [planId, bookId, data.effectiveMonth],
      );
      const budgetId = existingRevision?.id ?? randomUUID();

      if (existingRevision) {
        await db.runAsync(
          `UPDATE budgets
           SET total_budget = ?, is_active = ?, sync_status = ?, updated_at = datetime('now')
           WHERE id = ? AND book_id = ?;`,
          [
            totalBudget,
            data.isActive ? 1 : 0,
            DB_SYNC_STATUS.PENDING,
            budgetId,
            bookId,
          ],
        );
      } else {
        await db.runAsync(
          `INSERT INTO budgets (id, book_id, plan_id, month, total_budget, is_active)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [
            budgetId,
            bookId,
            planId,
            data.effectiveMonth,
            totalBudget,
            data.isActive ? 1 : 0,
          ],
        );
      }

      await saveAllocations(
        db,
        budgetId,
        data.currencyCode,
        data.allocations,
        bookId,
      );
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
  bookId: string,
) => {
  for (const currencyCode of currencyCodes) {
    const latestBudgets = await db.getAllAsync<BudgetRspType>(
      `SELECT b.id, b.book_id, b.plan_id, bp.currency_code, b.month,
              b.total_budget, b.is_active
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
       JOIN books book ON book.id = bp.book_id AND book.is_active = 1
       WHERE bp.currency_code = ?
         AND bp.book_id = ?
         AND bp.deleted_at IS NULL
       ORDER BY bp.book_id ASC;`,
      [effectiveMonth, currencyCode, bookId],
    );
    for (const latest of latestBudgets) {
      if (!latest.is_active) continue;

      if (latest.month === effectiveMonth) {
        await db.runAsync(
          `UPDATE budgets
           SET is_active = 0, sync_status = ?, updated_at = datetime('now')
           WHERE id = ? AND book_id = ?;`,
          [DB_SYNC_STATUS.PENDING, latest.id, latest.book_id],
        );
        continue;
      }

      const revisionId = randomUUID();
      await db.runAsync(
        `INSERT INTO budgets (id, book_id, plan_id, month, total_budget, is_active)
         VALUES (?, ?, ?, ?, ?, 0);`,
        [
          revisionId,
          latest.book_id,
          latest.plan_id,
          effectiveMonth,
          latest.total_budget,
        ],
      );
      const allocations = await db.getAllAsync<{
        category_id: string;
        amount: number;
      }>(
        `SELECT category_id, amount FROM budget_categories
         WHERE budget_id = ? AND book_id = ? AND deleted_at IS NULL;`,
        [latest.id, latest.book_id],
      );
      for (const allocation of allocations) {
        const copiedCategoryId = randomUUID();
        await db.runAsync(
          `INSERT INTO budget_categories (id, book_id, budget_id, category_id, amount)
           VALUES (?, ?, ?, ?, ?);`,
          [
            copiedCategoryId,
            latest.book_id,
            revisionId,
            allocation.category_id,
            allocation.amount,
          ],
        );
        await db.runAsync(
          `INSERT INTO budget_beneficiary_allocations (
             id, budget_category_id, beneficiary_id, amount
           )
           SELECT lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
             substr(lower(hex(randomblob(2))), 2) || '-' ||
             substr('89ab', abs(random()) % 4 + 1, 1) || '-' ||
             substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
             ?, bba.beneficiary_id, bba.amount
           FROM budget_beneficiary_allocations bba
           JOIN budget_categories old_bc ON old_bc.id = bba.budget_category_id
           JOIN beneficiaries beneficiary ON beneficiary.id = bba.beneficiary_id
           WHERE old_bc.budget_id = ?
             AND old_bc.book_id = ?
             AND old_bc.category_id = ?
             AND bba.deleted_at IS NULL
             AND beneficiary.is_active = 1
             AND beneficiary.deleted_at IS NULL;`,
          [copiedCategoryId, latest.id, latest.book_id, allocation.category_id],
        );
      }
    }
  }
};
