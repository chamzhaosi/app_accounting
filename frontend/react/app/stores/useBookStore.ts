import { create } from "zustand";
import {
  LAST_SELECTED_BOOK_KEY,
  getStoredItem,
  setStoredItem,
} from "../local/secureStore";
import { getBookById, getSystemDefaultBook } from "../sql/service/bookService";
import type { BookType } from "../sql/types/bookType";
import { DEBUG_TAG } from "../utils/debugLog";
import { resolveStartupBook } from "../utils/book";

type BookState = {
  activeBook: BookType | null;
  activeBookId: string | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  refreshActiveBook: () => Promise<void>;
  setActiveBook: (book: BookType) => Promise<void>;
};

export const useBookStore = create<BookState>((set, get) => ({
  activeBook: null,
  activeBookId: null,
  isHydrated: false,
  hydrate: async () => {
    try {
      const storedId = await getStoredItem(LAST_SELECTED_BOOK_KEY);
      const storedBook = storedId ? await getBookById(storedId) : null;
      const systemDefaultBook = await getSystemDefaultBook();
      if (!systemDefaultBook)
        throw new Error("System-default book is unavailable");
      const book = resolveStartupBook(storedBook, systemDefaultBook);
      set({ activeBook: book, activeBookId: book.id, isHydrated: true });
      if (storedId !== book.id)
        await setStoredItem(LAST_SELECTED_BOOK_KEY, book.id);
    } catch (error) {
      console.error(DEBUG_TAG.BOOK, "Unable to hydrate active book", error);
      throw error;
    }
  },
  refreshActiveBook: async () => {
    const id = get().activeBookId;
    if (!id) return;
    const book = await getBookById(id);
    if (book) {
      set({ activeBook: book });
      return;
    }
    const fallback = await getSystemDefaultBook();
    if (!fallback) throw new Error("System-default book is unavailable");
    set({ activeBook: fallback, activeBookId: fallback.id });
    await setStoredItem(LAST_SELECTED_BOOK_KEY, fallback.id);
  },
  setActiveBook: async (book) => {
    set({ activeBook: book, activeBookId: book.id });
    await setStoredItem(LAST_SELECTED_BOOK_KEY, book.id);
  },
}));

export const getRequiredActiveBookId = () => {
  const id = useBookStore.getState().activeBookId;
  if (!id) throw new Error("Active book is not ready");
  return id;
};

export const getActiveBookQueryScope = () =>
  useBookStore.getState().activeBookId ?? "book-not-ready";
