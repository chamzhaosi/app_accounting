import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Checkbox, List, Modal, Portal } from "react-native-paper";
import { bookQueryKeys, resetBookScopedQueries } from "../constants/queryKeys";
import {
  BOOK_MANAGEMENT_CREATE_URL,
  BOOK_MANAGEMENT_LIST_URL,
} from "../constants/urls";
import { getBooks } from "../sql/service/bookService";
import { useBookStore } from "../stores/useBookStore";
import { useThemeStore } from "../stores/useThemeStore";
import { DEBUG_TAG } from "../utils/debugLog";
import AppButton, { ButtonType } from "./AppButton";
import AppIcon from "./AppIcon";
import AppText from "./AppText";
import { useTranslation } from "../i18n/helper";

export default function BookSwitcher({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const activeBookId = useBookStore((state) => state.activeBookId);
  const setActiveBook = useBookStore((state) => state.setActiveBook);
  const [showInactive, setShowInactive] = useState(false);
  const { data = [] } = useQuery({
    queryKey: bookQueryKeys.list(true),
    queryFn: () => getBooks(true),
    enabled: visible,
  });
  const books = showInactive ? data : data.filter((book) => book.is_active);
  const selectBook = (book: (typeof data)[number]) => {
    if (book.id === activeBookId) {
      onDismiss();
      return;
    }

    const previousBookId = activeBookId ?? undefined;
    const persistSelection = setActiveBook(book);
    onDismiss();

    void Promise.all([
      persistSelection,
      resetBookScopedQueries(queryClient, previousBookId),
    ]).catch((error) =>
      console.error(DEBUG_TAG.BOOK, "Unable to finish switching books", error),
    );
  };
  const navigate = (path: string) => {
    onDismiss();
    router.push(path as never);
  };
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: THEME.surfaceContainerHigh },
        ]}
      >
        <AppText variant="headlineSmall" className="px-5 pt-5">
          {t("Switch Book")}
        </AppText>
        <ScrollView style={styles.list}>
          {books.map((book) => {
            const isActiveBookId = book.id === activeBookId;
            return (
              <List.Item
                style={{
                  paddingLeft: 8,
                  backgroundColor: isActiveBookId
                    ? THEME.primaryContainer
                    : undefined,
                }}
                key={book.id}
                title={book.label}
                description={
                  book.is_active ? undefined : t("Inactive · Read-only")
                }
                left={() => (
                  <View style={styles.icon}>
                    <AppIcon name={book.icon} size={24} />
                  </View>
                )}
                right={() =>
                  isActiveBookId ? <AppIcon name="Check" size={22} /> : null
                }
                onPress={() => selectBook(book)}
              />
            );
          })}
        </ScrollView>
        <Checkbox.Item
          label={t("Show inactive books")}
          status={showInactive ? "checked" : "unchecked"}
          onPress={() => setShowInactive((value) => !value)}
        />
        <View style={styles.actions}>
          <AppButton
            mode="text"
            compact
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            labelStyle={styles.actionButtonLabel}
            onPress={() => navigate(BOOK_MANAGEMENT_CREATE_URL)}
          >
            Add Book
          </AppButton>
          <AppButton
            variant={ButtonType.SECONDARY}
            compact
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            labelStyle={styles.actionButtonLabel}
            onPress={() => navigate(BOOK_MANAGEMENT_LIST_URL)}
          >
            Manage Books
          </AppButton>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    borderRadius: 24,
    marginHorizontal: 24,
    maxHeight: "76%",
    paddingBottom: 12,
  },
  list: { marginTop: 8 },
  icon: { alignItems: "center", justifyContent: "center", width: 40 },
  actions: {
    alignItems: "stretch",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 4,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
  },
  actionButtonContent: {
    minHeight: 44,
    marginVertical: 0,
  },
  actionButtonLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginHorizontal: 4,
  },
});
