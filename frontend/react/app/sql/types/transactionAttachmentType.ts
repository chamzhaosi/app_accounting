export type TransactionAttachmentInput = {
  id: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  width?: number;
  height?: number;
};

export type TransactionAttachmentType = TransactionAttachmentInput & {
  transactionId?: string;
  createdAt?: string;
  isPersisted: boolean;
};

export type TransactionAttachmentRow = {
  id: string;
  transaction_id: string;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
};
