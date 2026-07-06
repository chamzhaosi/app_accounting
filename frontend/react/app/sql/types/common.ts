type OrderDirection = "ASC" | "DESC";

export type OrderBy = {
  column: "id" | "label" | "created_at" | "updated_at";
  direction?: OrderDirection;
};

export type SQLQueryOptions = {
  orderBy?: OrderBy | OrderBy[];
  pageSize?: number;
  curPage?: number;
};
