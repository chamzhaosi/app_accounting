import {
  confirmCreditCardMinimumFromDB,
  ensureCreditCardCycleFromDB,
  getBalanceAtStatementFromDB,
  getCreditsAfterStatementFromDB,
  getCreditCardCyclesFromDB,
  getCreditCardSettingFromDB,
  getCurrentCreditCardCycleFromDB,
  getEnabledCreditCardSettingsFromDB,
  setCreditCardCycleNotificationsFromDB,
  setCreditCardCycleSkippedFromDB,
  updateCreditCardCycleFromDB,
  validateCreditCardMinimumFromDB,
} from "../repo/creditCardRepo";
import {
  cancelCreditCardNotifications,
  scheduleCreditCardNotifications,
} from "../../local/creditCardNotifications";
import { subtractAmounts } from "../../utils/amount";
import type { CreditCardCycleType } from "../types/accMgmtType";
import { DEBUG_TAG } from "../../utils/debugLog";

const dateAtDay = (year: number, month: number, day: number) => {
  const last = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, last));
};
const key = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const cycleDates = (statementDay: number, dueDay: number, now = new Date()) => {
  let statement = dateAtDay(now.getFullYear(), now.getMonth(), statementDay);
  if (statement > now)
    statement = dateAtDay(now.getFullYear(), now.getMonth() - 1, statementDay);
  const periodStart = dateAtDay(
    statement.getFullYear(),
    statement.getMonth() - 1,
    statementDay,
  );
  let due = dateAtDay(statement.getFullYear(), statement.getMonth(), dueDay);
  if (due <= statement)
    due = dateAtDay(statement.getFullYear(), statement.getMonth() + 1, dueDay);
  return {
    periodStart: key(periodStart),
    statementDate: key(statement),
    dueDate: key(due),
  };
};

export const reconcileCreditCardAccount = async (accountId: string) => {
  const setting = await getCreditCardSettingFromDB(accountId);
  if (!setting) return;
  if (!setting.reminder_enabled || !setting.account_is_active) {
    const cycles = await getCreditCardCyclesFromDB(accountId);
    for (const cycle of cycles) {
      await cancelCreditCardNotifications(cycle.notification_ids);
      await setCreditCardCycleNotificationsFromDB(cycle.id, []);
    }
    return;
  }
  const currentDates = cycleDates(setting.statement_day, setting.due_day);
  await ensureCreditCardCycleFromDB({ accountId, ...currentDates });
  const currentStatement = new Date(`${currentDates.statementDate}T00:00:00`);
  const nextAnchor = dateAtDay(
    currentStatement.getFullYear(),
    currentStatement.getMonth() + 1,
    setting.statement_day,
  );
  const nextDates = cycleDates(
    setting.statement_day,
    setting.due_day,
    nextAnchor,
  );
  await ensureCreditCardCycleFromDB({ accountId, ...nextDates });
  const cycles = await getCreditCardCyclesFromDB(accountId);
  const today = key(new Date());
  for (let index = 0; index < cycles.length; index += 1) {
    const cycle = cycles[index];
    if (cycle.statement_date > today) continue;
    const nextStatement = cycles[index + 1]?.statement_date;
    const balance = await getBalanceAtStatementFromDB(
      accountId,
      cycle.statement_date,
    );
    const statementAmount = cycle.is_manual_initial
      ? cycle.statement_amount
      : Math.max(0, -balance);
    const credits = await getCreditsAfterStatementFromDB(
      accountId,
      cycle.statement_date,
      nextStatement,
    );
    const remaining = Math.max(0, subtractAmounts(statementAmount, credits));
    const minimumConfirmed = await validateCreditCardMinimumFromDB(cycle);
    const status: CreditCardCycleType["status"] =
      remaining <= 0
        ? "paid"
        : minimumConfirmed && setting.stop_condition === "minimum"
          ? "minimum_paid"
          : cycle.is_skipped
            ? "skipped"
            : cycle.due_date < today
              ? "overdue"
              : "pending";
    await cancelCreditCardNotifications(cycle.notification_ids);
    await setCreditCardCycleNotificationsFromDB(cycle.id, []);
    await updateCreditCardCycleFromDB(cycle.id, {
      statement_amount: statementAmount,
      credited_amount: credits,
      remaining_due: remaining,
      status,
    });
    const updated = {
      ...cycle,
      statement_amount: statementAmount,
      credited_amount: credits,
      remaining_due: remaining,
      status,
    };
    let ids: string[] = [];
    if (remaining > 0 && status === "pending") {
      try {
        ids = await scheduleCreditCardNotifications(setting, updated);
      } catch (error) {
        console.error(DEBUG_TAG.CREDIT_CARD, "Unable to schedule reminders", {
          accountId,
          cycleId: cycle.id,
          error,
        });
      }
    }
    await setCreditCardCycleNotificationsFromDB(cycle.id, ids);
  }
};

export const reconcileAllCreditCards = async () => {
  const settings = await getEnabledCreditCardSettingsFromDB();
  for (const setting of settings) {
    try {
      await reconcileCreditCardAccount(setting.account_id);
    } catch (error) {
      console.error(
        DEBUG_TAG.CREDIT_CARD,
        "Unable to reconcile credit-card reminder",
        { accountId: setting.account_id, error },
      );
    }
  }
};

export const cancelCreditCardAccountNotifications = async (
  accountId: string,
) => {
  const cycles = await getCreditCardCyclesFromDB(accountId);
  for (const cycle of cycles) {
    await cancelCreditCardNotifications(cycle.notification_ids);
    await setCreditCardCycleNotificationsFromDB(cycle.id, []);
  }
};

export const getCurrentCreditCardCycle = async (accountId: string) => {
  await reconcileCreditCardAccount(accountId);
  return getCurrentCreditCardCycleFromDB(accountId);
};

export const setCreditCardCycleSkipped = async (
  accountId: string,
  cycleId: string,
  skipped: boolean,
) => {
  const cycle = await getCurrentCreditCardCycleFromDB(accountId);
  if (!cycle || cycle.id !== cycleId) return "Credit-card cycle not found.";
  await cancelCreditCardNotifications(cycle.notification_ids);
  await setCreditCardCycleSkippedFromDB(cycleId, skipped);
  await setCreditCardCycleNotificationsFromDB(cycleId, []);
  if (!skipped) await reconcileCreditCardAccount(accountId);
};

export const confirmCreditCardMinimumPayment = async (
  accountId: string,
  transactionId: string,
) => {
  const setting = await getCreditCardSettingFromDB(accountId);
  const cycle = await getCurrentCreditCardCycleFromDB(accountId);
  if (!setting || !cycle || setting.stop_condition !== "minimum") return;
  await cancelCreditCardNotifications(cycle.notification_ids);
  await confirmCreditCardMinimumFromDB(cycle.id, accountId, transactionId);
  await setCreditCardCycleNotificationsFromDB(cycle.id, []);
};

export const canConfirmCreditCardMinimumPayment = async (
  accountId: string,
  transactionDate: string,
) => {
  const setting = await getCreditCardSettingFromDB(accountId);
  const cycle = await getCurrentCreditCardCycleFromDB(accountId);
  return Boolean(
    setting?.stop_condition === "minimum" &&
    cycle &&
    cycle.remaining_due > 0 &&
    transactionDate >= cycle.statement_date &&
    transactionDate <= cycle.due_date &&
    !cycle.minimum_payment_confirmed &&
    (cycle.status === "pending" || cycle.status === "skipped"),
  );
};
