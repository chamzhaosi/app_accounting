import type { AppListCardItemType } from "../../components/AppListCardView";

type TranslateText = (text: string) => string;

export const getCategoryOrderIds = (items: AppListCardItemType[]): string[] =>
  items.map(({ id }) => id.toString());

export const getCategoryDisplayLabel = (
  label: string | null | undefined,
  translationKey: string | null | undefined,
  t: TranslateText,
) => (translationKey ? t(translationKey) : (label ?? ""));

export const getCategoryDisplayDescription = (
  description: string | null | undefined,
  translationKey: string | null | undefined,
  t: TranslateText,
) =>
  description && translationKey ? t(description) : (description ?? undefined);

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
