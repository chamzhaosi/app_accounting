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
