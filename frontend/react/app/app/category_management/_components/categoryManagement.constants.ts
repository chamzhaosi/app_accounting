import type { Route } from "react-native-tab-view";

export type CategoryManagementTabRoute = Route & {
  key: "inc" | "exp";
  title: string;
  typeId: number;
};

export const CATEGORY_MANAGEMENT_TAB_ROUTES: CategoryManagementTabRoute[] = [
  { key: "inc", title: "Income", typeId: 1 },
  { key: "exp", title: "Expense", typeId: 2 },
];

export const CATEGORY_REORDER_GRID = {
  cardHeightOffset: 12,
  columnCount: 3,
  gap: 16,
  horizontalMargin: 8,
} as const;

export const CATEGORY_REORDER_ICON_SIZE = 18;
export const CATEGORY_REORDER_HEADER_ICON_SIZE = 20;
export const CATEGORY_LIST_LOAD_MORE_THRESHOLD = 120;
export const CATEGORY_LIST_SCROLL_EVENT_THROTTLE = 200;
