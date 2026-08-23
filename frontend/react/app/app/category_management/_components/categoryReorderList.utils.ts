import type { AppListCardItemType } from "../../../components/AppListCardView";

export const swapCategoryItems = (
  items: AppListCardItemType[],
  firstItemId: string,
  secondItemId: string,
): AppListCardItemType[] | undefined => {
  const firstIndex = items.findIndex(({ id }) => id.toString() === firstItemId);
  const secondIndex = items.findIndex(
    ({ id }) => id.toString() === secondItemId,
  );
  if (firstIndex < 0 || secondIndex < 0) return;

  const reorderedItems = [...items];
  [reorderedItems[firstIndex], reorderedItems[secondIndex]] = [
    reorderedItems[secondIndex],
    reorderedItems[firstIndex],
  ];
  return reorderedItems;
};
