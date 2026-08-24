import type { CategoryManagementTabRoute } from "../hook/category_management/useCategoryManagementList";
import type { SelectOptionType } from "../components/AppSelect";
import { TXN_TYPE_ENUM } from "./enum";

export const CATEGORY_TRANSACTION_TYPE_OPTIONS: SelectOptionType[] = [
  { id: 1, label: "Income", value: "inc" },
  { id: 2, label: "Expense", value: "exp" },
];

export const CATEGORY_MANAGEMENT_TAB_ROUTES: CategoryManagementTabRoute[] = [
  { key: "inc", title: "Income", typeId: 1 },
  { key: "exp", title: "Expense", typeId: 2 },
];

export const TRANSACTION_CATEGORY_TYPE_IDS: Record<
  TXN_TYPE_ENUM,
  number | null
> = {
  [TXN_TYPE_ENUM.EXPENSE]: 2,
  [TXN_TYPE_ENUM.INCOME]: 1,
  [TXN_TYPE_ENUM.TRANSFER]: null,
  [TXN_TYPE_ENUM.ADJUSTMENT]: null,
};
