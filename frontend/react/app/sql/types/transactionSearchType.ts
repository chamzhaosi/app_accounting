import type { TXN_TYPE_ENUM } from "../../constants/enum";
import type { TransactionMgmtRspType } from "./transactionMgmtType";

export type TransactionSearchFilters = {
  startDate?: string;
  endDate?: string;
  accountIds?: string[];
  categoryIds?: string[];
  transactionTypes?: TXN_TYPE_ENUM[];
  currencyCodes?: string[];
  minimumAmount?: string;
  maximumAmount?: string;
};

export type TransactionSearchRequest = {
  keyword: string;
  numericKeyword?: number;
  filters: TransactionSearchFilters;
  curPage: number;
  pageSize: number;
};

export type TransactionSearchRspType = TransactionMgmtRspType & {
  search_score: number;
};

export type TransactionSearchFilterOptions = {
  accounts: Array<{
    id: string;
    icon: string;
    label: string;
    currencyCode: string;
    currentBalance: number;
    description: string | null;
    typeId: string;
    typeLabel: string;
  }>;
  categories: Array<{
    id: string;
    icon: string;
    label: string;
    typeId: number;
    translationKey: string | null;
  }>;
  currencyCodes: string[];
};
