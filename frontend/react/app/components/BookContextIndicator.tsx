import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { bookQueryKeys } from "../constants/queryKeys";
import { getBooks } from "../sql/service/bookService";
import { useBookStore } from "../stores/useBookStore";
import { useThemeStore } from "../stores/useThemeStore";
import AppIcon from "./AppIcon";
import AppText from "./AppText";
import BookSwitcher from "./BookSwitcher";
import { useTranslation } from "../i18n/helper";

export default function BookContextIndicator({
  switchable = false,
}: {
  switchable?: boolean;
}) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const book = useBookStore((state) => state.activeBook);
  const [visible, setVisible] = useState(false);
  const { data: books } = useQuery({
    queryKey: bookQueryKeys.list(true),
    queryFn: () => getBooks(true),
  });

  if (!book || !books || books.length <= 1) return null;
  const content = (
    <View
      style={[styles.content, { backgroundColor: THEME.tertiaryContainer }]}
    >
      <AppIcon name={book.icon} size={18} color={THEME.onTertiaryContainer} />
      <AppText numberOfLines={1} style={{ color: THEME.onTertiaryContainer }}>
        {book.label}
      </AppText>
      {switchable ? (
        <AppIcon
          name="ChevronDown"
          size={16}
          color={THEME.onTertiaryContainer}
        />
      ) : null}
    </View>
  );
  return (
    <>
      {switchable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Switch Book")}
          onPress={() => setVisible(true)}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
      <BookSwitcher visible={visible} onDismiss={() => setVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    borderRadius: 18,
    flexDirection: "row",
    gap: 6,
    maxWidth: 180,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
