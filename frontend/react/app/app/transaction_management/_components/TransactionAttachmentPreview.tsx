import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Modal, Portal, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "../../../i18n/helper";
import AppIcon from "../../../components/AppIcon";
import type { TransactionAttachmentType } from "../../../sql/types/transactionAttachmentType";
import {
  attachmentFileExists,
  resolveAttachmentUri,
} from "../../../sql/service/transactionAttachmentService";
import { useThemeStore } from "../../../stores/useThemeStore";

type TransactionAttachmentPreviewProps = {
  attachment?: TransactionAttachmentType;
  onDismiss: () => void;
  onRemove: (attachment: TransactionAttachmentType) => void;
};

export default function TransactionAttachmentPreview({
  attachment,
  onDismiss,
  onRemove,
}: TransactionAttachmentPreviewProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { THEME } = useThemeStore();
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    setUnavailable(
      attachment ? !attachmentFileExists(attachment.filePath) : false,
    );
  }, [attachment]);

  return (
    <Portal>
      <Modal
        visible={Boolean(attachment)}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.container,
          {
            backgroundColor: THEME.background,
            paddingBottom: insets.bottom,
            paddingTop: insets.top,
          },
        ]}
      >
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            accessibilityLabel={t("Back")}
            onPress={onDismiss}
          />
          <Text variant="titleLarge" style={styles.title}>
            {t("Attachment")}
          </Text>
          <IconButton
            icon="delete-outline"
            accessibilityLabel={t("Remove attachment")}
            onPress={() => attachment && onRemove(attachment)}
          />
        </View>
        <View style={styles.imageContainer}>
          {attachment && !unavailable && (
            <Image
              source={resolveAttachmentUri(attachment.filePath)}
              contentFit="contain"
              onError={() => setUnavailable(true)}
              style={styles.image}
              accessibilityLabel={t("Transaction attachment")}
            />
          )}
          {attachment && unavailable && (
            <View style={styles.unavailable}>
              <AppIcon
                name="ImageOff"
                size={48}
                color={THEME.onSurfaceVariant}
              />
              <Text style={{ color: THEME.onSurfaceVariant }}>
                {t("Image unavailable")}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  header: { alignItems: "center", flexDirection: "row", minHeight: 56 },
  image: { height: "100%", width: "100%" },
  imageContainer: { flex: 1, padding: 12 },
  title: { flex: 1, textAlign: "center" },
  unavailable: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
});
