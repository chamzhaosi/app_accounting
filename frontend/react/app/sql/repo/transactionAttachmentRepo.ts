import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { getDB } from "../db/database";
import type { TransactionAttachmentRow } from "../types/transactionAttachmentType";
import { getRequiredActiveBookId } from "../../stores/useBookStore";

export const getTransactionAttachmentsFromDB = async (
  transactionId: string,
): Promise<TransactionAttachmentRow[]> => {
  try {
    const db = await getDB();
    const bookId = getRequiredActiveBookId();
    const result = await db.getAllAsync<TransactionAttachmentRow>(
      `SELECT
         id, transaction_id, file_path, file_name, mime_type,
         file_size, width, height, created_at
       FROM transaction_attachments
       WHERE transaction_id = ?
         AND book_id = ?
       ORDER BY created_at ASC, id ASC;`,
      [transactionId, bookId],
    );
    debugLog(DEBUG_TAG.TRANSACTION_ATTACHMENT_DB, "Loaded attachments", {
      transactionId,
      count: result.length,
    });
    return result;
  } catch (e) {
    console.error(
      DEBUG_TAG.TRANSACTION_ATTACHMENT_DB,
      "Error when loading attachments",
      e,
    );
    throw e;
  }
};
