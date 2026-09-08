import { StyleSheet, View } from "react-native";
import { useBookStore } from "../stores/useBookStore";
import { useThemeStore } from "../stores/useThemeStore";
import AppIcon from "./AppIcon";
import AppText from "./AppText";
import { useTranslation } from "../i18n/helper";

export default function InactiveBookBanner() {
  const book = useBookStore((state) => state.activeBook);
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  if (!book || book.is_active) return null;
  return (
    <View style={[styles.banner, { backgroundColor: THEME.errorContainer }]}>
      <AppIcon name="Archive" size={20} color={THEME.onErrorContainer} />
      <AppText style={{ color: THEME.onErrorContainer }}>
        {t("This book is inactive. Records are read-only.")}
      </AppText>
    </View>
  );
}
const styles = StyleSheet.create({
  banner: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
