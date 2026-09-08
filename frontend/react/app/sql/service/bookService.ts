import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { DEFAULT_BOOK_ICON, normalizeBookLabel } from "../../utils/book";
import {
  createBookToDB,
  getBookByIdFromDB,
  getBookByNormalizedLabelFromDB,
  getBooksFromDB,
  getSystemDefaultBookFromDB,
  updateBookToDB,
} from "../repo/bookRepo";
import type { BookCreateReqType, BookUpdateReqType } from "../types/bookType";
import { DEFAULT_CURRENCY_CODE } from "../../constants/currencies";
import {
  getBookReportingCurrencyKey,
  getBookReportingCurrencySelectionKey,
  setStoredItem,
} from "../../local/secureStore";
import { ALL_CURRENCIES_VALUE } from "../../constants/currencies";

export const INACTIVE_BOOK_WRITE_ERROR =
  "This book is inactive and cannot be modified.";

export const getBooks = (includeInactive = true) =>
  getBooksFromDB(includeInactive);

export const getBookById = (id: string) => getBookByIdFromDB(id);

export const getSystemDefaultBook = () => getSystemDefaultBookFromDB();

export const assertBookWritable = async (bookId: string) => {
  const book = await getBookByIdFromDB(bookId);
  if (!book) return "Book not found.";
  if (!book.is_active) return INACTIVE_BOOK_WRITE_ERROR;
};

export const createBook = async (data: BookCreateReqType) => {
  const normalizedLabel = normalizeBookLabel(data.label);
  if (!normalizedLabel) return "Book label is required.";
  const existing = await getBookByNormalizedLabelFromDB(normalizedLabel);
  if (existing) return "A book with this name already exists.";

  debugLog(DEBUG_TAG.BOOK, "Creating book", { label: data.label });
  const id = await createBookToDB(
    {
      ...data,
      label: data.label.normalize("NFKC").trim().replace(/\s+/gu, " "),
      icon: data.icon || DEFAULT_BOOK_ICON,
    },
    normalizedLabel,
  );
  await Promise.all([
    setStoredItem(getBookReportingCurrencyKey(id), DEFAULT_CURRENCY_CODE),
    setStoredItem(
      getBookReportingCurrencySelectionKey(id),
      ALL_CURRENCIES_VALUE,
    ),
  ]);
  return { id };
};

export const updateBook = async (data: BookUpdateReqType) => {
  const current = await getBookByIdFromDB(data.id);
  if (!current) return "Book not found.";
  if (current.is_system_default && !data.isActive)
    return "The system-default book cannot be made inactive.";

  const normalizedLabel = normalizeBookLabel(data.label);
  if (!normalizedLabel) return "Book label is required.";
  const existing = await getBookByNormalizedLabelFromDB(normalizedLabel);
  if (existing && existing.id !== data.id)
    return "A book with this name already exists.";

  await updateBookToDB(
    {
      ...data,
      label: data.label.normalize("NFKC").trim().replace(/\s+/gu, " "),
      icon: data.icon || DEFAULT_BOOK_ICON,
    },
    normalizedLabel,
  );
};
