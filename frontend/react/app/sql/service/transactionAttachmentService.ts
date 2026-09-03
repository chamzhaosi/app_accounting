import { randomUUID } from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { TRANSACTION_ATTACHMENT_CONFIG } from "../../constants/transactionAttachments";
import { DEBUG_TAG, debugLog } from "../../utils/debugLog";
import { getTransactionAttachmentsFromDB } from "../repo/transactionAttachmentRepo";
import type {
  TransactionAttachmentInput,
  TransactionAttachmentType,
} from "../types/transactionAttachmentType";

export type AttachmentPickResult =
  | { status: "cancelled" }
  | { status: "permission-denied"; source: "camera" | "gallery" }
  | { status: "selected"; attachments: TransactionAttachmentType[] };

export type StagedAttachmentFile = {
  originalPath: string;
  trashName: string;
};

const attachmentDirectory = new Directory(
  Paths.document,
  TRANSACTION_ATTACHMENT_CONFIG.directory,
);
const trashDirectory = new Directory(
  Paths.document,
  TRANSACTION_ATTACHMENT_CONFIG.trashDirectory,
);

const ensureDirectory = (directory: Directory) => {
  directory.create({ idempotent: true, intermediates: true });
};

export const resolveAttachmentUri = (relativePath: string) =>
  new File(Paths.document, relativePath).uri;

export const attachmentFileExists = (relativePath: string) =>
  new File(Paths.document, relativePath).exists;

const optimizeAndStoreImage = async (
  asset: ImagePicker.ImagePickerAsset,
): Promise<TransactionAttachmentType> => {
  const id = randomUUID();
  const fileName = `${id}.jpg`;
  const relativePath = `${TRANSACTION_ATTACHMENT_CONFIG.directory}/${fileName}`;
  let cachedFile: File | undefined;

  try {
    const context = ImageManipulator.manipulate(asset.uri);
    const longestDimension = Math.max(asset.width, asset.height);
    if (longestDimension > TRANSACTION_ATTACHMENT_CONFIG.maxDimension) {
      if (asset.width >= asset.height) {
        context.resize({
          width: TRANSACTION_ATTACHMENT_CONFIG.maxDimension,
          height: null,
        });
      } else {
        context.resize({
          width: null,
          height: TRANSACTION_ATTACHMENT_CONFIG.maxDimension,
        });
      }
    }

    const image = await context.renderAsync();
    const optimized = await image.saveAsync({
      compress: TRANSACTION_ATTACHMENT_CONFIG.compressionQuality,
      format: SaveFormat.JPEG,
    });
    cachedFile = new File(optimized.uri);
    ensureDirectory(attachmentDirectory);
    const destination = new File(attachmentDirectory, fileName);
    await cachedFile.copy(destination);

    return {
      id,
      filePath: relativePath,
      fileName,
      mimeType: "image/jpeg",
      fileSize: destination.size,
      width: optimized.width,
      height: optimized.height,
      isPersisted: false,
    };
  } finally {
    if (cachedFile?.exists) cachedFile.delete();
  }
};

const optimizeAssets = async (
  assets: ImagePicker.ImagePickerAsset[],
): Promise<TransactionAttachmentType[]> => {
  const attachments: TransactionAttachmentType[] = [];
  try {
    for (const asset of assets) {
      attachments.push(await optimizeAndStoreImage(asset));
    }
    return attachments;
  } catch (e) {
    await deleteAttachmentFiles(attachments);
    throw e;
  }
};

export const takeTransactionPhoto = async (): Promise<AttachmentPickResult> => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return { status: "permission-denied", source: "camera" };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 1,
  });
  if (result.canceled) return { status: "cancelled" };
  return {
    status: "selected",
    attachments: await optimizeAssets(result.assets.slice(0, 1)),
  };
};

export const pickTransactionImages = async (
  selectionLimit: number,
): Promise<AttachmentPickResult> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { status: "permission-denied", source: "gallery" };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    allowsMultipleSelection: true,
    selectionLimit,
    quality: 1,
  });
  if (result.canceled) return { status: "cancelled" };
  return {
    status: "selected",
    attachments: await optimizeAssets(result.assets.slice(0, selectionLimit)),
  };
};

export const deleteAttachmentFile = async (
  attachment: Pick<TransactionAttachmentInput, "filePath">,
) => {
  const file = new File(Paths.document, attachment.filePath);
  if (file.exists) file.delete();
};

export const deleteAttachmentFiles = async (
  attachments: Pick<TransactionAttachmentInput, "filePath">[],
) => {
  const failures: unknown[] = [];
  for (const attachment of attachments) {
    try {
      await deleteAttachmentFile(attachment);
    } catch (e) {
      failures.push(e);
    }
  }
  if (failures.length) throw failures[0];
};

export const stageAttachmentFiles = async (
  attachments: Pick<TransactionAttachmentInput, "filePath">[],
): Promise<StagedAttachmentFile[]> => {
  ensureDirectory(trashDirectory);
  const staged: StagedAttachmentFile[] = [];
  try {
    for (const attachment of attachments) {
      const original = new File(Paths.document, attachment.filePath);
      if (!original.exists) continue;
      const trashName = `${randomUUID()}.jpg`;
      await original.move(new File(trashDirectory, trashName));
      staged.push({ originalPath: attachment.filePath, trashName });
    }
    return staged;
  } catch (e) {
    await restoreStagedAttachmentFiles(staged);
    throw e;
  }
};

export const restoreStagedAttachmentFiles = async (
  staged: StagedAttachmentFile[],
) => {
  ensureDirectory(attachmentDirectory);
  for (const item of staged) {
    const trashFile = new File(trashDirectory, item.trashName);
    if (trashFile.exists) {
      await trashFile.move(new File(Paths.document, item.originalPath));
    }
  }
};

export const finalizeStagedAttachmentFiles = async (
  staged: StagedAttachmentFile[],
) => {
  for (const item of staged) {
    const trashFile = new File(trashDirectory, item.trashName);
    if (trashFile.exists) trashFile.delete();
  }
};

export const getTransactionAttachments = async (
  transactionId: string,
): Promise<TransactionAttachmentType[]> => {
  const rows = await getTransactionAttachmentsFromDB(transactionId);
  return rows.map((row) => ({
    id: row.id,
    transactionId: row.transaction_id,
    filePath: row.file_path,
    fileName: row.file_name,
    mimeType: row.mime_type ?? "image/jpeg",
    fileSize: row.file_size ?? undefined,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    createdAt: row.created_at,
    isPersisted: true,
  }));
};

export const assertAttachmentLimit = (
  existingCount: number,
  newAttachments: TransactionAttachmentInput[],
) => {
  if (
    existingCount + newAttachments.length >
    TRANSACTION_ATTACHMENT_CONFIG.maxAttachments
  ) {
    debugLog(DEBUG_TAG.TRANSACTION_ATTACHMENT, "Attachment limit exceeded", {
      existingCount,
      newCount: newAttachments.length,
    });
    return "You can attach up to 5 images.";
  }
};
