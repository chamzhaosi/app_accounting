export const DEFAULT_BOOK_ICON = "UserRound" as const;

export const normalizeBookLabel = (value: string) =>
  value.normalize("NFKC").trim().replace(/\s+/gu, " ").toLowerCase();

export const resolveStartupBook = <T extends { is_active: boolean }>(
  storedBook: T | null,
  systemDefaultBook: T,
) => (storedBook?.is_active ? storedBook : systemDefaultBook);
