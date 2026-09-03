import { Image } from "expo-image";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Modal,
  Portal,
  Text,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppEmpty from "../../../components/AppEmpty";
import AppIcon from "../../../components/AppIcon";
import { useTranslation } from "../../../i18n/helper";
import {
  attachmentFileExists,
  resolveAttachmentUri,
} from "../../../sql/service/transactionAttachmentService";
import type { TransactionAttachmentType } from "../../../sql/types/transactionAttachmentType";
import { useThemeStore } from "../../../stores/useThemeStore";

type TransactionAttachmentManagerProps = {
  attachments: TransactionAttachmentType[];
  isManagerVisible: boolean;
  isProcessing: boolean;
  isSourceMenuVisible: boolean;
  maxAttachments: number;
  onAdd: () => void;
  onChooseGallery: () => void;
  onCloseManager: () => void;
  onCloseSourceMenu: () => void;
  onPreview: (attachment: TransactionAttachmentType) => void;
  onRemove: (attachment: TransactionAttachmentType) => void;
  onTakePhoto: () => void;
};

const GRID_HORIZONTAL_PADDING = 12;
const GRID_GAP = 10;
const THUMBNAIL_SIZE = 112;
const MANAGER_HEADER_HEIGHT = 56;
const MANAGER_FOOTER_HEIGHT = 76;
const EMPTY_CONTENT_HEIGHT = 144;

function AttachmentThumbnail({
  attachment,
  onPreview,
  onRemove,
}: {
  attachment: TransactionAttachmentType;
  onPreview: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const { THEME } = useThemeStore();
  const [unavailable, setUnavailable] = useState(
    !attachmentFileExists(attachment.filePath),
  );

  return (
    <View style={styles.thumbnailContainer}>
      <Pressable
        accessibilityLabel={t("Preview attachment")}
        accessibilityRole="button"
        onPress={onPreview}
        style={[
          styles.thumbnail,
          { backgroundColor: THEME.surfaceContainerHighest },
        ]}
      >
        {unavailable ? (
          <View style={styles.unavailable}>
            <AppIcon name="ImageOff" size={30} color={THEME.onSurfaceVariant} />
            <Text
              variant="labelSmall"
              style={{ color: THEME.onSurfaceVariant, textAlign: "center" }}
            >
              {t("Image unavailable")}
            </Text>
          </View>
        ) : (
          <Image
            source={resolveAttachmentUri(attachment.filePath)}
            contentFit="cover"
            onError={() => setUnavailable(true)}
            style={styles.thumbnailImage}
          />
        )}
      </Pressable>
      <Pressable
        accessibilityLabel={t("Remove attachment")}
        accessibilityRole="button"
        onPress={onRemove}
        style={styles.removeButton}
      >
        <View style={styles.removeButtonCircle}>
          <AppIcon name="X" size={14} color="#ffffff" />
        </View>
      </Pressable>
    </View>
  );
}

export default function TransactionAttachmentManager({
  attachments,
  isManagerVisible,
  isProcessing,
  isSourceMenuVisible,
  maxAttachments,
  onAdd,
  onChooseGallery,
  onCloseManager,
  onCloseSourceMenu,
  onPreview,
  onRemove,
  onTakePhoto,
}: TransactionAttachmentManagerProps) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { THEME } = useThemeStore();
  const isAtLimit = attachments.length >= maxAttachments;
  const columnCount = Math.max(
    1,
    Math.min(
      maxAttachments,
      Math.floor(
        (width - GRID_HORIZONTAL_PADDING * 2 + GRID_GAP) /
          (THUMBNAIL_SIZE + GRID_GAP),
      ),
    ),
  );
  const rowCount = Math.ceil(attachments.length / columnCount);
  const gridContentHeight =
    rowCount === 0
      ? EMPTY_CONTENT_HEIGHT
      : GRID_HORIZONTAL_PADDING * 2 +
        rowCount * THUMBNAIL_SIZE +
        Math.max(0, rowCount - 1) * GRID_GAP;
  const managerHeight = Math.min(
    height * 0.85,
    MANAGER_HEADER_HEIGHT +
      MANAGER_FOOTER_HEIGHT +
      gridContentHeight +
      insets.bottom,
  );

  return (
    <Portal>
      <Modal
        visible={isManagerVisible}
        onDismiss={onCloseManager}
        contentContainerStyle={[
          styles.manager,
          {
            backgroundColor: THEME.background,
            height: managerHeight,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            accessibilityLabel={t("Back")}
            onPress={onCloseManager}
          />
          <Text variant="titleLarge" style={styles.headerTitle}>
            {t("Attachments")}
          </Text>
          <Button
            icon="plus"
            compact
            disabled={isAtLimit || isProcessing}
            onPress={onAdd}
          >
            {t("Add")}
          </Button>
        </View>
        <FlatList
          key={`attachment-grid-${columnCount}`}
          data={attachments}
          keyExtractor={(item) => item.id}
          numColumns={columnCount}
          contentContainerStyle={[
            styles.grid,
            attachments.length === 0 && styles.emptyGrid,
          ]}
          columnWrapperStyle={styles.gridRow}
          ListEmptyComponent={<AppEmpty />}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <AttachmentThumbnail
                attachment={item}
                onPreview={() => onPreview(item)}
                onRemove={() => onRemove(item)}
              />
            </View>
          )}
        />
        <View style={styles.footer}>
          {isProcessing && <ActivityIndicator size="small" />}
          <Text variant="bodyMedium">
            {t("{{count}} of {{max}} attachments", {
              count: attachments.length,
              max: maxAttachments,
            })}
          </Text>
          {isAtLimit && (
            <Text variant="labelSmall" style={{ color: THEME.error }}>
              {t("You can attach up to 5 images.")}
            </Text>
          )}
        </View>
      </Modal>

      <Modal
        visible={isSourceMenuVisible}
        onDismiss={onCloseSourceMenu}
        contentContainerStyle={[
          styles.sourceMenu,
          {
            backgroundColor: THEME.surfaceContainerHigh,
            maxHeight: height * 0.6,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        <View
          style={[styles.handle, { backgroundColor: THEME.outlineVariant }]}
        />
        <Text variant="titleLarge" style={styles.sourceTitle}>
          {t("Add Attachment")}
        </Text>
        {isProcessing ? (
          <View style={styles.processing}>
            <ActivityIndicator />
            <Text>{t("Processing image...")}</Text>
          </View>
        ) : (
          <>
            <Button
              icon="camera"
              contentStyle={styles.sourceAction}
              onPress={onTakePhoto}
            >
              {t("Take Photo")}
            </Button>
            <Button
              icon="image-multiple"
              contentStyle={styles.sourceAction}
              onPress={onChooseGallery}
            >
              {t("Choose from Gallery")}
            </Button>
            <Button onPress={onCloseSourceMenu}>{t("Cancel")}</Button>
          </>
        )}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  emptyGrid: { justifyContent: "center" },
  footer: { alignItems: "center", gap: 4, padding: 16 },
  grid: {
    flexGrow: 1,
    gap: GRID_GAP,
    justifyContent: "center",
    padding: GRID_HORIZONTAL_PADDING,
  },
  gridItem: { alignItems: "center", flex: 1 },
  gridRow: { gap: GRID_GAP, justifyContent: "center" },
  handle: {
    alignSelf: "center",
    borderRadius: 2,
    height: 4,
    marginTop: 8,
    width: 40,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 56,
    paddingRight: 8,
  },
  headerTitle: { flex: 1, textAlign: "center" },
  manager: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    bottom: 0,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
  },
  processing: { alignItems: "center", gap: 12, paddingVertical: 20 },
  removeButton: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    margin: 0,
    position: "absolute",
    right: 2,
    top: 2,
    width: 32,
  },
  removeButtonCircle: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  sourceAction: { height: 52, justifyContent: "flex-start" },
  sourceMenu: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    bottom: 0,
    left: 0,
    paddingHorizontal: 16,
    position: "absolute",
    right: 0,
  },
  sourceTitle: { paddingHorizontal: 8, paddingVertical: 16 },
  thumbnail: {
    borderRadius: 10,
    height: THUMBNAIL_SIZE,
    overflow: "hidden",
    width: THUMBNAIL_SIZE,
  },
  thumbnailContainer: { position: "relative" },
  thumbnailImage: { height: "100%", width: "100%" },
  unavailable: {
    alignItems: "center",
    flex: 1,
    gap: 6,
    justifyContent: "center",
    padding: 8,
  },
});
