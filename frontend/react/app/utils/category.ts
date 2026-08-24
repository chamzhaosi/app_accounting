type TranslateText = (text: string) => string;

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
