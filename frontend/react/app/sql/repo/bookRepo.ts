import { randomUUID } from "expo-crypto";
import { DEBUG_TAG } from "../../utils/debugLog";
import { getDB } from "../db/database";
import type {
  BookCreateReqType,
  BookType,
  BookUpdateReqType,
} from "../types/bookType";
import { DEFAULT_CATEGORY_SEEDS } from "../db/seed";
import { DEFAULT_CURRENCY_CODE } from "../../constants/currencies";

const BOOK_COLUMNS = `
  id, label, normalized_label, description, icon,
  is_active, is_system_default, sort_order, created_at, updated_at
`;

export const getBooksFromDB = async (includeInactive = true) => {
  const db = await getDB();
  try {
    return await db.getAllAsync<BookType>(
      `SELECT ${BOOK_COLUMNS}
       FROM books
       WHERE (? = 1 OR is_active = 1)
       ORDER BY sort_order ASC, created_at ASC;`,
      [includeInactive ? 1 : 0],
    );
  } catch (error) {
    console.error(DEBUG_TAG.BOOK_DB, "Unable to load books", error);
    throw error;
  }
};

export const getBookByIdFromDB = async (id: string) => {
  const db = await getDB();
  try {
    return await db.getFirstAsync<BookType>(
      `SELECT ${BOOK_COLUMNS} FROM books WHERE id = ?;`,
      [id],
    );
  } catch (error) {
    console.error(DEBUG_TAG.BOOK_DB, "Unable to load book", { id, error });
    throw error;
  }
};

export const getSystemDefaultBookFromDB = async () => {
  const db = await getDB();
  try {
    return await db.getFirstAsync<BookType>(
      `SELECT ${BOOK_COLUMNS}
       FROM books
       WHERE is_system_default = 1
       LIMIT 1;`,
    );
  } catch (error) {
    console.error(DEBUG_TAG.BOOK_DB, "Unable to load default book", error);
    throw error;
  }
};

export const getBookByNormalizedLabelFromDB = async (
  normalizedLabel: string,
) => {
  const db = await getDB();
  try {
    return await db.getFirstAsync<BookType>(
      `SELECT ${BOOK_COLUMNS}
       FROM books
       WHERE normalized_label = ?;`,
      [normalizedLabel],
    );
  } catch (error) {
    console.error(DEBUG_TAG.BOOK_DB, "Unable to check book label", error);
    throw error;
  }
};

export const createBookToDB = async (
  data: BookCreateReqType,
  normalizedLabel: string,
) => {
  const db = await getDB();
  const id = randomUUID();
  try {
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO books (
           id, label, normalized_label, description, icon,
           is_active, is_system_default, sort_order
         ) VALUES (
           ?, ?, ?, ?, ?, 1, 0,
           (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM books)
         );`,
        [
          id,
          data.label,
          normalizedLabel,
          data.description?.trim() || null,
          data.icon,
        ],
      );

      await db.runAsync(
        `INSERT INTO currency_preferences (book_id, code, is_default)
         VALUES (?, ?, 1);`,
        [id, DEFAULT_CURRENCY_CODE],
      );

      const nextSortOrderByType = new Map<number, number>();
      for (const [
        typeId,
        label,
        icon,
        description,
        isSystem,
      ] of DEFAULT_CATEGORY_SEEDS) {
        await db.runAsync(
          `INSERT INTO categories (
             id, book_id, type_id, label, icon, descriptions,
             translation_key, sort_order, is_active, is_system
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?);`,
          [
            randomUUID(),
            id,
            typeId,
            label,
            icon,
            description,
            label,
            nextSortOrderByType.get(typeId) ?? 0,
            isSystem ? 1 : 0,
          ],
        );
        nextSortOrderByType.set(
          typeId,
          (nextSortOrderByType.get(typeId) ?? 0) + 1,
        );
      }
    });
    return id;
  } catch (error) {
    console.error(DEBUG_TAG.BOOK_DB, "Unable to create and initialize book", {
      label: data.label,
      error,
    });
    throw error;
  }
};

export const updateBookToDB = async (
  data: BookUpdateReqType,
  normalizedLabel: string,
) => {
  const db = await getDB();
  try {
    await db.runAsync(
      `UPDATE books
       SET label = ?, normalized_label = ?, description = ?, icon = ?,
           is_active = ?, updated_at = datetime('now')
       WHERE id = ?;`,
      [
        data.label,
        normalizedLabel,
        data.description?.trim() || null,
        data.icon,
        data.isActive ? 1 : 0,
        data.id,
      ],
    );
  } catch (error) {
    console.error(DEBUG_TAG.BOOK_DB, "Unable to update book", {
      id: data.id,
      error,
    });
    throw error;
  }
};
