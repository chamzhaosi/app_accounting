import type { AppListCardItemType } from "../../components/AppListCardView";

export const getCategoryOrderIds = (items: AppListCardItemType[]): string[] =>
  items.map(({ id }) => id.toString());
