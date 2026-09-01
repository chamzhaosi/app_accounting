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
};

export type AccountTypeBalanceTotalType = {
  type_id: string;
  currency_code: string;
  balance: number;
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
};

export type BalanceChangeKind = "expense" | "income" | "correction";

export type AccMgmtUpdateReqType = AccMgmtCreateReqType & {
  id: string;
  balanceChangeKind?: BalanceChangeKind;
  balanceChangeCategoryId?: string;
  balanceChangeDate?: string;
  balanceChangeDescription?: string;
};
