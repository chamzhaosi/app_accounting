import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppToast } from "../../components/AppToast";
import { TRANSACTION_ATTACHMENT_CONFIG } from "../../constants/transactionAttachments";
import { transactionManagementQueryKeys } from "../../constants/queryKeys";
import { useTranslation } from "../../i18n/helper";
import {
  deleteAttachmentFile,
  deleteAttachmentFiles,
  getTransactionAttachments,
  pickTransactionImages,
  takeTransactionPhoto,
} from "../../sql/service/transactionAttachmentService";
import type {
  TransactionAttachmentInput,
  TransactionAttachmentType,
} from "../../sql/types/transactionAttachmentType";
import { DEBUG_TAG } from "../../utils/debugLog";

export default function useTransactionAttachments(transactionId?: string) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [newAttachments, setNewAttachments] = useState<
    TransactionAttachmentType[]
  >([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>(
    [],
  );
  const [isProcessingAttachment, setIsProcessingAttachment] = useState(false);
  const [isSourceMenuVisible, setIsSourceMenuVisible] = useState(false);
  const [isManagerVisible, setIsManagerVisible] = useState(false);
  const [previewAttachment, setPreviewAttachment] =
    useState<TransactionAttachmentType>();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const pendingNavigationAction = useRef<
    Parameters<typeof navigation.dispatch>[0] | undefined
  >(undefined);
  const allowNavigation = useRef(false);
  const processingAttachment = useRef(false);

  const {
    data: existingAttachments = [],
    error: attachmentQueryError,
    isLoading,
  } = useQuery({
    queryKey: transactionManagementQueryKeys.attachments(transactionId ?? ""),
    queryFn: () => getTransactionAttachments(transactionId!),
    enabled: Boolean(transactionId),
  });

  const visibleAttachments = useMemo(
    () => [
      ...existingAttachments.filter(
        (attachment) => !removedAttachmentIds.includes(attachment.id),
      ),
      ...newAttachments,
    ],
    [existingAttachments, newAttachments, removedAttachmentIds],
  );
  const hasAttachmentChanges =
    newAttachments.length > 0 || removedAttachmentIds.length > 0;
  const remainingCapacity =
    TRANSACTION_ATTACHMENT_CONFIG.maxAttachments - visibleAttachments.length;

  useEffect(() => {
    if (!attachmentQueryError) return;
    console.error(
      DEBUG_TAG.TRANSACTION_ATTACHMENT,
      "Unable to load attachments",
      attachmentQueryError,
    );
  }, [attachmentQueryError]);

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (event) => {
        if (allowNavigation.current || !hasAttachmentChanges) return;
        event.preventDefault();
        pendingNavigationAction.current = event.data.action;
        setShowDiscardDialog(true);
      }),
    [hasAttachmentChanges, navigation],
  );

  const processPick = useCallback(
    async (source: "camera" | "gallery") => {
      if (processingAttachment.current) return;
      if (remainingCapacity <= 0) {
        AppToast.error({ message: t("You can attach up to 5 images.") });
        return;
      }

      try {
        processingAttachment.current = true;
        setIsProcessingAttachment(true);
        const result =
          source === "camera"
            ? await takeTransactionPhoto()
            : await pickTransactionImages(remainingCapacity);
        if (result.status === "cancelled") return;
        if (result.status === "permission-denied") {
          AppToast.error({
            message: t(
              result.source === "camera"
                ? "Camera permission is required to take a photo."
                : "Photo permission is required to choose an image.",
            ),
          });
          return;
        }
        setNewAttachments((current) => [
          ...current,
          ...result.attachments.slice(0, remainingCapacity),
        ]);
        setIsManagerVisible(true);
      } catch (e) {
        console.error(
          DEBUG_TAG.TRANSACTION_ATTACHMENT,
          "Unable to process attachment",
          e,
        );
        AppToast.error({ message: t("Unable to process the image.") });
      } finally {
        setIsSourceMenuVisible(false);
        processingAttachment.current = false;
        setIsProcessingAttachment(false);
      }
    },
    [remainingCapacity, t],
  );

  const onAttachmentPress = useCallback(() => {
    if (visibleAttachments.length) setIsManagerVisible(true);
    else setIsSourceMenuVisible(true);
  }, [visibleAttachments.length]);

  const onAddPress = useCallback(() => {
    if (remainingCapacity <= 0) {
      AppToast.error({ message: t("You can attach up to 5 images.") });
      return;
    }
    setIsSourceMenuVisible(true);
  }, [remainingCapacity, t]);

  const onPreviewAttachment = useCallback(
    (attachment?: TransactionAttachmentType) => {
      if (attachment) {
        setIsManagerVisible(false);
        setPreviewAttachment(attachment);
        return;
      }

      setPreviewAttachment(undefined);
      setIsManagerVisible(true);
    },
    [],
  );

  const removeAttachment = useCallback(
    async (attachment: TransactionAttachmentType) => {
      try {
        if (attachment.isPersisted) {
          setRemovedAttachmentIds((current) =>
            current.includes(attachment.id)
              ? current
              : [...current, attachment.id],
          );
        } else {
          await deleteAttachmentFile(attachment);
          setNewAttachments((current) =>
            current.filter((item) => item.id !== attachment.id),
          );
        }
        if (previewAttachment?.id === attachment.id) {
          setPreviewAttachment(undefined);
          setIsManagerVisible(true);
        }
      } catch (e) {
        console.error(
          DEBUG_TAG.TRANSACTION_ATTACHMENT,
          "Unable to remove attachment",
          e,
        );
        AppToast.error({ message: t("Unable to remove the attachment.") });
      }
    },
    [previewAttachment?.id, t],
  );

  const discardChanges = useCallback(async () => {
    try {
      await deleteAttachmentFiles(newAttachments);
      setNewAttachments([]);
      setRemovedAttachmentIds([]);
      setShowDiscardDialog(false);
      const action = pendingNavigationAction.current;
      pendingNavigationAction.current = undefined;
      if (action) {
        allowNavigation.current = true;
        navigation.dispatch(action);
      }
    } catch (e) {
      console.error(
        DEBUG_TAG.TRANSACTION_ATTACHMENT,
        "Unable to discard attachment changes",
        e,
      );
      AppToast.error({ message: t("Unable to discard attachment changes.") });
    }
  }, [navigation, newAttachments, t]);

  const cleanupUncommittedFiles = useCallback(async () => {
    await deleteAttachmentFiles(newAttachments);
    setNewAttachments([]);
    setRemovedAttachmentIds([]);
  }, [newAttachments]);

  const markChangesCommitted = useCallback(
    (willNavigate: boolean) => {
      allowNavigation.current = willNavigate;
      setNewAttachments([]);
      setRemovedAttachmentIds([]);
      if (transactionId) {
        queryClient.removeQueries({
          queryKey: transactionManagementQueryKeys.attachments(transactionId),
        });
      }
    },
    [queryClient, transactionId],
  );

  return {
    attachmentCount: visibleAttachments.length,
    attachments: visibleAttachments,
    attachmentInputs: newAttachments.map<TransactionAttachmentInput>(
      ({ id, filePath, fileName, mimeType, fileSize, width, height }) => ({
        id,
        filePath,
        fileName,
        mimeType,
        fileSize,
        width,
        height,
      }),
    ),
    cancelDiscard: () => {
      pendingNavigationAction.current = undefined;
      setShowDiscardDialog(false);
    },
    cleanupUncommittedFiles,
    discardChanges,
    isLoadingAttachments: isLoading,
    isManagerVisible,
    isProcessingAttachment,
    isSourceMenuVisible,
    markChangesCommitted,
    maxAttachments: TRANSACTION_ATTACHMENT_CONFIG.maxAttachments,
    onAddPress,
    onAttachmentPress,
    onChooseGallery: () => void processPick("gallery"),
    onCloseManager: () => setIsManagerVisible(false),
    onCloseSourceMenu: () => setIsSourceMenuVisible(false),
    onPreviewAttachment,
    onTakePhoto: () => void processPick("camera"),
    previewAttachment,
    remainingCapacity,
    removeAttachment,
    removedAttachmentIds,
    showDiscardDialog,
  };
}
