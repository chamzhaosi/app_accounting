import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import {
  Checkbox,
  IconButton,
  List,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import AppButton, {
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../../components/AppButton";
import AppIcon from "../../../components/AppIcon";
import AppTextInput from "../../../components/AppTextInput";
import type { CurrencyDefinition } from "../../../constants/currencies";
import { useTranslation } from "../../../i18n/helper";
import { useThemeStore } from "../../../stores/useThemeStore";

type CurrencyPickerModalProps = {
  currencies: CurrencyDefinition[];
  defaultCurrencyCode: string;
  enabledCurrencyCodes: string[];
  onDismiss: () => void;
  onSearchChange: (value: string) => void;
  onToggle: (code: string) => void;
  search: string;
  visible: boolean;
};

export default function CurrencyPickerModal({
  currencies,
  defaultCurrencyCode,
  enabledCurrencyCodes,
  onDismiss,
  onSearchChange,
  onToggle,
  search,
  visible,
}: CurrencyPickerModalProps) {
  const { height, width } = useWindowDimensions();
  const { t } = useTranslation();
  const { THEME } = useThemeStore();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.container,
          {
            backgroundColor: THEME.surfaceContainerHigh,
            height: height * 0.82,
            width: Math.min(width * 0.94, 620),
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <Text variant="titleLarge">{t("Choose currencies")}</Text>
            <Text variant="bodySmall" style={{ color: THEME.onSurfaceVariant }}>
              {t("{{count}} currencies enabled", {
                count: enabledCurrencyCodes.length,
              })}
            </Text>
          </View>
          <IconButton
            icon="close"
            accessibilityLabel={t("Close currency picker")}
            onPress={onDismiss}
          />
        </View>

        <View style={styles.searchContainer}>
          <AppTextInput
            mode="outlined"
            label={t("Search currencies")}
            placeholder={t("Search by currency, code, or country")}
            value={search}
            onChangeText={onSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
            showClear
            shouldTranslateText={false}
            left={<TextInput.Icon icon="magnify" />}
          />
        </View>

        <FlatList
          data={currencies}
          keyExtractor={({ code }) => code}
          keyboardShouldPersistTaps="handled"
          extraData={enabledCurrencyCodes}
          renderItem={({ item }) => {
            const isDefault = item.code === defaultCurrencyCode;
            const isEnabled = enabledCurrencyCodes.includes(item.code);

            return (
              <List.Item
                title={`${item.code} · ${item.name} · ${item.symbol}`}
                description={item.countries.join(", ")}
                titleNumberOfLines={1}
                descriptionNumberOfLines={2}
                onPress={isDefault ? undefined : () => onToggle(item.code)}
                style={[
                  styles.item,
                  {
                    backgroundColor: isEnabled
                      ? THEME.secondaryContainer
                      : THEME.surfaceContainer,
                    borderBottomColor: THEME.outlineVariant,
                  },
                ]}
                left={() => (
                  <View style={styles.checkboxContainer}>
                    <Checkbox.Android
                      status={isEnabled ? "checked" : "unchecked"}
                      disabled={isDefault}
                    />
                  </View>
                )}
                right={
                  isDefault
                    ? () => (
                        <View style={styles.defaultLabel}>
                          <Text variant="labelSmall">{t("Default")}</Text>
                        </View>
                      )
                    : undefined
                }
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <AppIcon
                name="SearchX"
                size={48}
                color={THEME.onSurfaceVariant}
              />
              <Text variant="titleMedium">{t("No currencies found")}</Text>
              <Text
                variant="bodyMedium"
                style={{ color: THEME.onSurfaceVariant }}
              >
                {t("Try a currency name, ISO code, or country name.")}
              </Text>
            </View>
          }
          contentContainerStyle={
            currencies.length === 0 ? styles.emptyContent : undefined
          }
        />

        <View style={[styles.footer, { borderTopColor: THEME.outlineVariant }]}>
          <AppButton {...SUBMIT_BTN_CONTENT_STYLE} onPress={onDismiss}>
            Done
          </AppButton>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    borderRadius: 14,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 4,
    paddingTop: 8,
  },
  headerTitle: {
    flex: 1,
  },
  searchContainer: {
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
  },
  checkboxContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  defaultLabel: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 12,
  },
  emptyContent: {
    flexGrow: 1,
  },
  empty: {
    alignItems: "center",
    flex: 1,
    gap: 8,
    justifyContent: "center",
    padding: 32,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
});
