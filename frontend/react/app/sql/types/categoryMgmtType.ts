export type CategoryMgmtRspType = {
  id: string;
  type_id: number;
  label: string;
  icon: string;
  descriptions?: string | null;
  translation_key?: string | null;
  sort_order: number;
  is_active: boolean;
  is_system: boolean;
};

export type CategoryPeriodSummaryRspType = CategoryMgmtRspType & {
  period_total: number;
  transaction_count: number;
  currency_totals: CategoryCurrencyTotalType[];
};

export type CategoryCurrencyTotalType = {
  currency_code: string;
  total_amount: number;
};

export type CategoryMgmtCreateReqType = {
  typeId: number;
  label: string;
  icon: string;
  descriptions?: string;
};

export type CategoryMgmtUpdateReqType = CategoryMgmtCreateReqType & {
  id: string;
  isLabelCustomized: boolean;
};
