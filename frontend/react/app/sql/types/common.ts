type OrderDirection = "ASC" | "DESC";

export type OrderBy = {
  column:
    | "id"
    | "label"
    | "created_at"
    | "updated_at"
    | "transaction_date"
    | "transactions.transaction_date"
    | "transactions.created_at"
    | "accounts.created_at";
  direction?: OrderDirection;
};

export type SQLQueryOptions = {
  orderBy?: OrderBy | OrderBy[];
  pageSize?: number;
  curPage?: number;
};
