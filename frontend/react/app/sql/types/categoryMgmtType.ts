export type CategoryMgmtRspType = {
  id: string;
  type_id: number;
  label: string;
  icon: string;
  descriptions?: string | null;
  is_active: boolean;
  is_system: boolean;
};

export type CategoryPeriodSummaryRspType = CategoryMgmtRspType & {
  period_total: number;
  transaction_count: number;
};

export type CategoryMgmtCreateReqType = {
  typeId: number;
  label: string;
  icon: string;
  descriptions?: string;
};

export type CategoryMgmtUpdateReqType = CategoryMgmtCreateReqType & {
  id: string;
};
