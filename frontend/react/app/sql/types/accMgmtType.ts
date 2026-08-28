export type AccMgmtRspType = {
  id: string;
  type_id: string;
  type_label: string;
  type_icon: string;
  currency_code: string;
  label: string;
  descriptions?: string | null;
  current_balance: number;
  is_main_account: boolean;
  is_active: boolean;
  is_currency_enabled?: boolean;
};

export type AccMgmtCreateReqType = {
  typeId: string;
  currencyCode: string;
  label: string;
  descriptions?: string;
  currentBalance?: string;
  isMainAccount: boolean;
};

export type BalanceChangeKind = "expense" | "income" | "correction";

export type AccMgmtUpdateReqType = AccMgmtCreateReqType & {
  id: string;
  balanceChangeKind?: BalanceChangeKind;
  balanceChangeCategoryId?: string;
  balanceChangeDate?: string;
  balanceChangeDescription?: string;
};
