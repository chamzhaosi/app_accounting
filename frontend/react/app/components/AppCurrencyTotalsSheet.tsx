import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import { IconButton, Modal, Portal, Text } from "react-native-paper";
import { useTranslation } from "../i18n/helper";
import { useAmountPrivacyStore } from "../stores/useAmountPrivacyStore";
import { useThemeStore } from "../stores/useThemeStore";
import { formatPrivateLocalizedAmount } from "../utils/number";

export type AppCurrencyTotal = {
  amount: number;
  currencyCode: string;
};

type AppCurrencyTotalsSheetProps = {
  onDismiss: () => void;
  subtitle: string;
  title: string;
  totals: AppCurrencyTotal[];
  visible: boolean;
};

export default function AppCurrencyTotalsSheet({
  onDismiss,
  subtitle,
  title,
  totals,
  visible,
}: AppCurrencyTotalsSheetProps) {
  const { height } = useWindowDimensions();
  const { locale, t } = useTranslation();
  const { THEME } = useThemeStore();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.container,
          {
            backgroundColor: THEME.surfaceContainerHigh,
            maxHeight: height * 0.7,
          },
        ]}
      >
        <View
          style={[styles.handle, { backgroundColor: THEME.outlineVariant }]}
        />
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text variant="titleLarge">{title}</Text>
            <Text
              variant="bodyMedium"
              style={{ color: THEME.onSurfaceVariant }}
            >
              {subtitle}
            </Text>
          </View>
          <IconButton
            icon="close"
            accessibilityLabel={t("Close")}
            onPress={onDismiss}
          />
        </View>
        <FlatList
          data={totals}
          keyExtractor={({ currencyCode }) => currencyCode}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View
              style={[
                styles.totalRow,
                {
                  backgroundColor: THEME.surfaceContainer,
                  borderBottomColor: THEME.outlineVariant,
                },
              ]}
            >
              <Text
                variant="titleMedium"
                numberOfLines={1}
                style={styles.currencyCode}
              >
                {item.currencyCode}
              </Text>
              <Text
                variant="titleMedium"
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                numberOfLines={1}
                style={styles.amount}
              >
                {formatPrivateLocalizedAmount(
                  item.amount,
                  item.currencyCode,
                  locale,
                  areAmountsVisible,
                )}
              </Text>
            </View>
          )}
        />
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  amount: {
    flex: 1,
    flexShrink: 1,
    fontWeight: "700",
    marginLeft: 16,
    minWidth: 0,
    textAlign: "right",
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    bottom: 0,
    left: 0,
    overflow: "hidden",
    paddingBottom: 12,
    position: "absolute",
    right: 0,
  },
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
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 8,
  },
  headerText: { flex: 1, gap: 2 },
  currencyCode: { flexShrink: 0, minWidth: 48 },
  list: { paddingHorizontal: 12 },
  totalRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 56,
    paddingHorizontal: 16,
  },
});
