import {
  getTransactionSearchFilterOptionsFromDB,
  searchTransactionsFromDB,
} from "../repo/transactionSearchRepo";
import type {
  TransactionSearchFilterOptions,
  TransactionSearchFilters,
  TransactionSearchRspType,
} from "../types/transactionSearchType";

const NUMERIC_KEYWORD_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

export const getNumericSearchKeyword = (
  keyword: string,
): number | undefined => {
  if (!NUMERIC_KEYWORD_PATTERN.test(keyword)) return undefined;
  const value = Math.abs(Number(keyword));
  return Number.isFinite(value) ? value : undefined;
};

export const searchTransactions = async ({
  keyword,
  filters,
  curPage,
  pageSize,
}: {
  keyword: string;
  filters: TransactionSearchFilters;
  curPage: number;
  pageSize: number;
}): Promise<TransactionSearchRspType[]> => {
  const normalizedKeyword = keyword.trim();
  return searchTransactionsFromDB({
    keyword: normalizedKeyword,
    numericKeyword: getNumericSearchKeyword(normalizedKeyword),
    filters,
    curPage,
    pageSize,
  });
};

export const getTransactionSearchFilterOptions =
  async (): Promise<TransactionSearchFilterOptions> =>
    getTransactionSearchFilterOptionsFromDB();
