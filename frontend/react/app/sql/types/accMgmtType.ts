export type AccMgmtRspType = {
  id: string;
  type_id: string;
  type_label: string;
  type_icon: string;
  currency_code: string;
  label: string;
  descriptions?: string | null;
  current_balance: number;
  is_active: boolean;
  is_asset: boolean;
  is_currency_enabled?: boolean;
  credit_card_reminder_enabled?: boolean | null;
  statement_day?: number | null;
  due_day?: number | null;
  reminder_lead_days?: number | null;
  reminder_time?: string | null;
  reminder_stop_condition?: "full" | "minimum" | null;
  reminder_first_cycle_mode?: "current" | "next" | null;
};

export type AccountTypeBalanceTotalType = {
  type_id: string;
  currency_code: string;
  balance: number;
  currency_account_count: number;
  account_count: number;
};

export type AccMgmtCreateReqType = {
  typeId: string;
  currencyCode: string;
  label: string;
  descriptions?: string;
  currentBalance?: string;
  isActive: boolean;
  isAsset: boolean;
  balancePosition: "debt" | "overpayment";
  reminderEnabled: boolean;
  statementDay: string;
  dueDay: string;
  reminderLeadDays: string;
  reminderTime: string;
  reminderStopCondition: "full" | "minimum";
  firstCycleMode: "current" | "next";
  currentCycleRemainingDue?: string;
  currentCycleDueDate?: string;
};

export type CreditCardCycleType = {
  id: string;
  account_id: string;
  period_start: string;
  statement_date: string;
  due_date: string;
  statement_amount: number;
  credited_amount: number;
  remaining_due: number;
  minimum_payment_confirmed: boolean;
  minimum_payment_transaction_id: string | null;
  minimum_payment_amount: number | null;
  is_skipped: boolean;
  status: "pending" | "paid" | "minimum_paid" | "skipped" | "overdue";
  notification_ids: string | null;
  is_manual_initial: boolean;
};

export type BalanceChangeKind = "expense" | "income" | "correction";

export type AccMgmtUpdateReqType = AccMgmtCreateReqType & {
  id: string;
  balanceChangeKind?: BalanceChangeKind;
  balanceChangeCategoryId?: string;
  balanceChangeDate?: string;
  balanceChangeDescription?: string;
};
