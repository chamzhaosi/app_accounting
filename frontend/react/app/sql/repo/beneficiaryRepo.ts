import { randomUUID } from "expo-crypto";
import { DB_SYNC_STATUS } from "../../constants/enum";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { getDB } from "../db/database";
import type {
  BeneficiaryRspType,
  BeneficiarySaveReqType,
  BeneficiaryType,
  BeneficiaryUpdateReqType,
} from "../types/beneficiaryType";

type BeneficiaryRow = Omit<
  BeneficiaryRspType,
  "is_active" | "is_self" | "member_ids"
> & {
  is_active: number;
  is_self: number;
};

type GroupMemberRow = {
  group_beneficiary_id: string;
  individual_beneficiary_id: string;
};

const mapBeneficiary = (
  row: BeneficiaryRow,
  memberIds: string[] = [],
): BeneficiaryRspType => ({
  ...row,
  is_active: Boolean(row.is_active),
  is_self: Boolean(row.is_self),
  member_ids: memberIds,
});

const getMemberIds = async (id: string) => {
  const db = await getDB();
  const rows = await db.getAllAsync<{ individual_beneficiary_id: string }>(
    `SELECT individual_beneficiary_id
     FROM beneficiary_group_members
     WHERE group_beneficiary_id = ?;`,
    [id],
  );
  return rows.map(({ individual_beneficiary_id }) => individual_beneficiary_id);
};

export const getBeneficiaryListFromDB = async (
  type?: BeneficiaryType,
  includeInactive = true,
): Promise<BeneficiaryRspType[]> => {
  try {
    const db = await getDB();
    const rows = await db.getAllAsync<BeneficiaryRow>(
      `SELECT id, type, icon, name, normalized_name, relationship,
              descriptions, is_active, is_self
       FROM beneficiaries
       WHERE deleted_at IS NULL
         AND (? IS NULL OR type = ?)
         AND (? = 1 OR is_active = 1)
       ORDER BY is_self DESC, is_active DESC, name COLLATE NOCASE ASC;`,
      [type ?? null, type ?? null, includeInactive ? 1 : 0],
    );
    debugLog(DEBUG_TAG.BENEFICIARY_DB, "Loaded beneficiaries", {
      type,
      includeInactive,
      count: rows.length,
    });
    if (type !== "GROUP" || rows.length === 0)
      return rows.map((row) => mapBeneficiary(row));

    const groupIds = rows.map(({ id }) => id);
    const memberRows = await db.getAllAsync<GroupMemberRow>(
      `SELECT group_beneficiary_id, individual_beneficiary_id
       FROM beneficiary_group_members
       WHERE group_beneficiary_id IN (${groupIds.map(() => "?").join(", ")});`,
      groupIds,
    );
    const memberIdsByGroup = new Map<string, string[]>();
    memberRows.forEach(
      ({ group_beneficiary_id, individual_beneficiary_id }) => {
        const memberIds = memberIdsByGroup.get(group_beneficiary_id) ?? [];
        memberIds.push(individual_beneficiary_id);
        memberIdsByGroup.set(group_beneficiary_id, memberIds);
      },
    );

    return rows.map((row) =>
      mapBeneficiary(row, memberIdsByGroup.get(row.id) ?? []),
    );
  } catch (error) {
    console.error(
      DEBUG_TAG.BENEFICIARY_DB,
      "Unable to load beneficiaries",
      error,
    );
    throw error;
  }
};

export const getBeneficiaryByIdFromDB = async (
  id: string,
): Promise<BeneficiaryRspType | null> => {
  try {
    const db = await getDB();
    const row = await db.getFirstAsync<BeneficiaryRow>(
      `SELECT id, type, icon, name, normalized_name, relationship,
              descriptions, is_active, is_self
       FROM beneficiaries
       WHERE id = ? AND deleted_at IS NULL;`,
      [id],
    );
    if (!row) return null;
    return mapBeneficiary(
      row,
      row.type === "GROUP" ? await getMemberIds(id) : [],
    );
  } catch (error) {
    console.error(
      DEBUG_TAG.BENEFICIARY_DB,
      "Unable to load beneficiary",
      error,
    );
    throw error;
  }
};

export const getBeneficiaryByNormalizedNameFromDB = async (
  normalizedName: string,
) => {
  try {
    const db = await getDB();
    const row = await db.getFirstAsync<BeneficiaryRow>(
      `SELECT id, type, icon, name, normalized_name, relationship,
              descriptions, is_active, is_self
       FROM beneficiaries
       WHERE normalized_name = ? AND deleted_at IS NULL;`,
      [normalizedName],
    );
    return row ? mapBeneficiary(row) : null;
  } catch (error) {
    console.error(
      DEBUG_TAG.BENEFICIARY_DB,
      "Unable to check beneficiary name",
      error,
    );
    throw error;
  }
};

export const getSelfBeneficiaryFromDB = async () => {
  try {
    const db = await getDB();
    const row = await db.getFirstAsync<BeneficiaryRow>(
      `SELECT id, type, icon, name, normalized_name, relationship,
              descriptions, is_active, is_self
       FROM beneficiaries
       WHERE is_self = 1 AND deleted_at IS NULL
       LIMIT 1;`,
    );
    return row ? mapBeneficiary(row) : null;
  } catch (error) {
    console.error(
      DEBUG_TAG.BENEFICIARY_DB,
      "Unable to load self beneficiary",
      error,
    );
    throw error;
  }
};

const replaceGroupMembers = async (groupId: string, memberIds: string[]) => {
  const db = await getDB();
  await db.runAsync(
    "DELETE FROM beneficiary_group_members WHERE group_beneficiary_id = ?;",
    [groupId],
  );
  for (const memberId of memberIds) {
    await db.runAsync(
      `INSERT INTO beneficiary_group_members (
         group_beneficiary_id, individual_beneficiary_id
       ) VALUES (?, ?);`,
      [groupId, memberId],
    );
  }
};

export const createBeneficiaryToDB = async (data: BeneficiarySaveReqType) => {
  try {
    const db = await getDB();
    const id = randomUUID();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO beneficiaries (
           id, type, icon, name, normalized_name, relationship,
           descriptions, is_active, is_self
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0);`,
        [
          id,
          data.type,
          data.icon,
          data.name,
          data.normalizedName,
          data.type === "INDIVIDUAL" ? data.relationship || null : null,
          data.descriptions || null,
          data.isActive ? 1 : 0,
        ],
      );
      if (data.type === "GROUP") await replaceGroupMembers(id, data.memberIds);
    });
    debugLog(DEBUG_TAG.BENEFICIARY_DB, "Created beneficiary", {
      id,
      type: data.type,
    });
    return id;
  } catch (error) {
    console.error(
      DEBUG_TAG.BENEFICIARY_DB,
      "Unable to create beneficiary",
      error,
    );
    throw error;
  }
};

const createCurrentBudgetRevisionsForDeactivation = async (
  currentMonth: string,
  deactivatedBeneficiaryId: string,
) => {
  const db = await getDB();
  const hasNonSelf = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM beneficiaries
     WHERE is_active = 1 AND is_self = 0 AND deleted_at IS NULL;`,
  );
  const clearAll = (hasNonSelf?.count ?? 0) === 0;
  const plans = await db.getAllAsync<{
    plan_id: string;
    budget_id: string;
    month: string;
  }>(
    `SELECT bp.id AS plan_id, b.id AS budget_id, b.month
     FROM budget_plans bp
     JOIN budgets b ON b.id = (
       SELECT latest.id FROM budgets latest
       WHERE latest.plan_id = bp.id
         AND latest.month <= ?
         AND latest.deleted_at IS NULL
       ORDER BY latest.month DESC LIMIT 1
     )
     WHERE bp.deleted_at IS NULL;`,
    [currentMonth],
  );

  for (const plan of plans) {
    let budgetId = plan.budget_id;
    if (plan.month !== currentMonth) {
      budgetId = randomUUID();
      await db.runAsync(
        `INSERT INTO budgets (id, plan_id, month, total_budget, is_active)
         SELECT ?, plan_id, ?, total_budget, is_active
         FROM budgets WHERE id = ?;`,
        [budgetId, currentMonth, plan.budget_id],
      );
      const categories = await db.getAllAsync<{
        old_id: string;
        category_id: string;
        amount: number;
      }>(
        `SELECT id AS old_id, category_id, amount
         FROM budget_categories
         WHERE budget_id = ? AND deleted_at IS NULL;`,
        [plan.budget_id],
      );
      for (const category of categories) {
        const newCategoryId = randomUUID();
        await db.runAsync(
          `INSERT INTO budget_categories (id, budget_id, category_id, amount)
           VALUES (?, ?, ?, ?);`,
          [newCategoryId, budgetId, category.category_id, category.amount],
        );
        if (clearAll) continue;
        await db.runAsync(
          `INSERT INTO budget_beneficiary_allocations (
             id, budget_category_id, beneficiary_id, amount
           )
           SELECT lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
             substr(lower(hex(randomblob(2))), 2) || '-' ||
             substr('89ab', abs(random()) % 4 + 1, 1) ||
             substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
             ?, bba.beneficiary_id, bba.amount
           FROM budget_beneficiary_allocations bba
           JOIN beneficiaries beneficiary ON beneficiary.id = bba.beneficiary_id
           WHERE bba.budget_category_id = ?
             AND bba.beneficiary_id <> ?
             AND bba.deleted_at IS NULL
             AND beneficiary.is_active = 1
             AND beneficiary.deleted_at IS NULL;`,
          [newCategoryId, category.old_id, deactivatedBeneficiaryId],
        );
      }
    } else {
      await db.runAsync(
        `UPDATE budget_beneficiary_allocations
         SET deleted_at = datetime('now'), sync_status = ?, updated_at = datetime('now')
         WHERE deleted_at IS NULL
           AND budget_category_id IN (
             SELECT id FROM budget_categories
             WHERE budget_id = ? AND deleted_at IS NULL
           )
           AND (? = 1 OR beneficiary_id = ?);`,
        [
          DB_SYNC_STATUS.PENDING,
          budgetId,
          clearAll ? 1 : 0,
          deactivatedBeneficiaryId,
        ],
      );
    }
  }

  await db.runAsync(
    `UPDATE budget_beneficiary_allocations
     SET deleted_at = datetime('now'), sync_status = ?, updated_at = datetime('now')
     WHERE deleted_at IS NULL
       AND budget_category_id IN (
         SELECT bc.id
         FROM budget_categories bc
         JOIN budgets b ON b.id = bc.budget_id
         WHERE bc.deleted_at IS NULL
           AND b.deleted_at IS NULL
           AND b.month >= ?
       )
       AND (? = 1 OR beneficiary_id = ?);`,
    [
      DB_SYNC_STATUS.PENDING,
      currentMonth,
      clearAll ? 1 : 0,
      deactivatedBeneficiaryId,
    ],
  );
};

export const updateBeneficiaryToDB = async (
  data: BeneficiaryUpdateReqType,
  currentMonth: string,
) => {
  try {
    const db = await getDB();
    await db.withTransactionAsync(async () => {
      const current = await db.getFirstAsync<{
        is_active: number;
        is_self: number;
      }>(
        `SELECT is_active, is_self FROM beneficiaries
         WHERE id = ? AND deleted_at IS NULL;`,
        [data.id],
      );
      if (!current) throw new Error(`Beneficiary not found: ${data.id}`);
      const nextIsActive = current.is_self ? 1 : data.isActive ? 1 : 0;
      await db.runAsync(
        `UPDATE beneficiaries
         SET icon = ?, name = ?, normalized_name = ?, relationship = ?,
             descriptions = ?, is_active = ?, sync_status = ?,
             updated_at = datetime('now')
         WHERE id = ? AND deleted_at IS NULL;`,
        [
          data.icon,
          data.name,
          data.normalizedName,
          data.type === "INDIVIDUAL" ? data.relationship || null : null,
          data.descriptions || null,
          nextIsActive,
          DB_SYNC_STATUS.PENDING,
          data.id,
        ],
      );
      if (data.type === "GROUP")
        await replaceGroupMembers(data.id, data.memberIds);
      if (current.is_active && !nextIsActive) {
        await createCurrentBudgetRevisionsForDeactivation(
          currentMonth,
          data.id,
        );
      }
    });
    debugLog(DEBUG_TAG.BENEFICIARY_DB, "Updated beneficiary", { id: data.id });
  } catch (error) {
    console.error(
      DEBUG_TAG.BENEFICIARY_DB,
      "Unable to update beneficiary",
      error,
    );
    throw error;
  }
};

export const getRelevantBeneficiariesFromDB = async (
  startDate: string,
  endDate: string,
) => {
  try {
    const db = await getDB();
    const rows = await db.getAllAsync<BeneficiaryRow>(
      `SELECT DISTINCT b.id, b.type, b.icon, b.name, b.normalized_name,
              b.relationship, b.descriptions, b.is_active, b.is_self
       FROM beneficiaries b
       LEFT JOIN transactions t
         ON t.beneficiary_id = b.id
        AND t.transaction_date >= ?
        AND t.transaction_date <= ?
        AND t.deleted_at IS NULL
       WHERE b.deleted_at IS NULL
         AND (b.is_active = 1 OR t.id IS NOT NULL)
       ORDER BY b.is_self DESC, b.is_active DESC, b.name COLLATE NOCASE ASC;`,
      [startDate, endDate],
    );
    return rows.map((row) => mapBeneficiary(row));
  } catch (error) {
    console.error(
      DEBUG_TAG.BENEFICIARY_DB,
      "Unable to load relevant beneficiaries",
      error,
    );
    throw error;
  }
};
