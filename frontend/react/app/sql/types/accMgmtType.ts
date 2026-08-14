export type AccMgmtRspType = {
  id: string;
  type_id: string;
  type_label: string;
  type_icon: string;
  label: string;
  descriptions?: string | null;
  current_balance: number;
  is_main_account: boolean;
  is_active: boolean;
};

export type AccMgmtCreateReqType = {
  typeId: string;
  label: string;
  descriptions?: string;
  currentBalance?: string;
  isMainAccount: boolean;
};

export type AccMgmtUpdateReqType = AccMgmtCreateReqType & {
  id: string;
};
