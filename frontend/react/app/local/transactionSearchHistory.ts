import { clearStoredItem, getStoredItem, setStoredItem } from "./secureStore";

const TRANSACTION_SEARCH_HISTORY_KEY = "transaction_search_history";
const TRANSACTION_SEARCH_HISTORY_LIMIT = 10;

export const getTransactionSearchHistory = async (): Promise<string[]> => {
  const storedValue = await getStoredItem(TRANSACTION_SEARCH_HISTORY_KEY);
  if (!storedValue) return [];

  try {
    const parsed: unknown = JSON.parse(storedValue);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, TRANSACTION_SEARCH_HISTORY_LIMIT);
  } catch {
    return [];
  }
};

export const saveTransactionSearchKeyword = async (
  keyword: string,
  currentHistory: string[],
): Promise<string[]> => {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) return currentHistory;

  const normalizedKey = normalizedKeyword.toLocaleLowerCase();
  const nextHistory = [
    normalizedKeyword,
    ...currentHistory.filter((item) => {
      const existingKey = item.trim().toLocaleLowerCase();
      return (
        existingKey !== normalizedKey && !normalizedKey.startsWith(existingKey)
      );
    }),
  ].slice(0, TRANSACTION_SEARCH_HISTORY_LIMIT);
  await setStoredItem(
    TRANSACTION_SEARCH_HISTORY_KEY,
    JSON.stringify(nextHistory),
  );
  return nextHistory;
};

export const removeTransactionSearchKeyword = async (
  keyword: string,
  currentHistory: string[],
): Promise<string[]> => {
  const normalizedKey = keyword.trim().toLocaleLowerCase();
  const nextHistory = currentHistory.filter(
    (item) => item.trim().toLocaleLowerCase() !== normalizedKey,
  );
  await setStoredItem(
    TRANSACTION_SEARCH_HISTORY_KEY,
    JSON.stringify(nextHistory),
  );
  return nextHistory;
};

export const clearTransactionSearchHistory = async (): Promise<void> =>
  clearStoredItem(TRANSACTION_SEARCH_HISTORY_KEY);
