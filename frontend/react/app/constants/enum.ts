export enum DB_SYNC_STATUS {
  PENDING = "pending",
  SYNCED = "synced",
  FAILED = "failed",
  CONFLICT = "conflict",
}

export enum TXN_TYPE_ENUM {
  EXPENSE = "expense",
  INCOME = "income",
  TRANSFER = "transfer",
  ADJUSTMENT = "adjustment",
}
