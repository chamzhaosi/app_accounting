import { TXN_TYPE_ENUM } from "../../constants/enum";

export type TransactionMgmtCreateReqType = {
  transactionType: TXN_TYPE_ENUM;
  categoryId: string;
  accountId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  description?: string;
  transactionDate: string;
};

export type TransactionMgmtUpdateReqType = TransactionMgmtCreateReqType & {
  id: string;
};

export type TransactionDateRangeTotalsType = {
  income_total: number;
  expense_total: number;
};

export type TransactionDailyTotalsType = TransactionDateRangeTotalsType & {
  transaction_date: string;
  recorded_income_total: number;
  recorded_expense_total: number;
};

export type AccountDailyBalanceChangeType = {
  transaction_date: string;
  balance_change: number;
};

export type CategoryDailyTotalType = {
  transaction_date: string;
  daily_total: number;
};

export type AccountDateRangeFlowTotalsType = {
  in_total: number;
  out_total: number;
};

export type CategoryDateRangeSummaryType = {
  total_amount: number;
  transaction_count: number;
};

export type TransactionMgmtRspType = {
  id: string;
  transaction_type: TXN_TYPE_ENUM;
  category_id: string | null;
  account_id: string | null;
  from_account_id: string | null;
  to_account_id: string | null;
  amount: number;
  descriptions: string | null;
  transaction_date: string;
  is_active: boolean;
  category_label: string | null;
  category_icon: string | null;
  account_label: string | null;
  from_account_label: string | null;
  to_account_label: string | null;
};
