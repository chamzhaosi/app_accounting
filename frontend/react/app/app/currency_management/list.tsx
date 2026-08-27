import { Stack, router } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppIcon from "../../components/AppIcon";
import AppDialog from "../../components/AppDialog";
import AppView from "../../components/AppView";
import useCurrencyManagement from "../../hook/currency_management/useCurrencyManagement";
import { useTranslation } from "../../i18n/helper";
import { useThemeStore } from "../../stores/useThemeStore";
import CurrencyPickerModal from "./_components/CurrencyPickerModal";
import CurrencyRow from "./_components/CurrencyRow";

export default function CurrencyManagementList() {
  const { t } = useTranslation();
  const { THEME } = useThemeStore();
  const logic = useCurrencyManagement();

  if (logic.isLoading) {
    return (
      <AppView className="items-center justify-center">
        <ActivityIndicator size="large" />
      </AppView>
    );
  }

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
      <Stack.Screen options={{ title: t("Currency Management") }} />
      <CurrencyPickerModal
        currencies={logic.filteredCurrencies}
        defaultCurrencyCode={logic.defaultCurrencyCode}
        enabledCurrencyCodes={logic.enabledCurrencyCodes}
        onDismiss={logic.dismissPicker}
        onSearchChange={logic.setSearch}
        onToggle={logic.toggleCurrency}
        search={logic.search}
        visible={logic.isPickerVisible}
      />
      <AppDialog
        title="Disable selected currencies?"
        iconName="CircleAlert"
        description="Existing data stays unchanged. Active budgets will become inactive, and {{currencies}} cannot be used for new accounts, transactions, or budgets."
        descriptionValues={{
          currencies: logic.disabledCurrencyCodes.join(", "),
        }}
        highlightedDescriptionValue={logic.disabledCurrencyCodes.join(", ")}
        showDialog={logic.showDisableDialog}
        onDismiss={logic.dismissDisableDialog}
        actionRender={
          <>
            <AppButton
              variant={ButtonType.SECONDARY}
              disabled={logic.isSaving}
              onPress={logic.dismissDisableDialog}
              style={styles.dialogButton}
              contentStyle={styles.dialogButtonContent}
              labelStyle={styles.dialogButtonLabel}
            >
              Keep
            </AppButton>
            <AppButton
              variant={ButtonType.ERROR}
              loading={logic.isSaving}
              disabled={logic.isSaving}
              style={styles.dialogButton}
              contentStyle={styles.dialogButtonContent}
              labelStyle={styles.dialogButtonLabel}
              onPress={async () => {
                const isSaved = await logic.onConfirmDisable();
                if (isSaved) router.back();
              }}
            >
              Disable
            </AppButton>
          </>
        }
      />

      <View style={styles.header}>
        <Surface
          elevation={1}
          style={[styles.summary, { backgroundColor: THEME.surfaceContainer }]}
        >
          <View style={styles.summaryIcon}>
            <AppIcon name="Coins" size={28} />
          </View>
          <View style={styles.summaryText}>
            <Text variant="titleMedium">
              {t("Default currency")}: {logic.defaultCurrencyCode}
            </Text>
            <Text variant="bodySmall" style={{ color: THEME.onSurfaceVariant }}>
              {t("{{count}} currencies enabled", {
                count: logic.enabledCurrencyCodes.length,
              })}
            </Text>
          </View>
        </Surface>
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: THEME.onSurface }]}
        >
          {t("Your currencies")}
        </Text>
      </View>

      <FlatList
        data={logic.enabledCurrencies}
        keyExtractor={({ code }) => code}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        extraData={[logic.defaultCurrencyCode, logic.enabledCurrencyCodes]}
        renderItem={({ item }) => (
          <CurrencyRow
            currency={item}
            disabled={logic.isSaving}
            isDefault={item.code === logic.defaultCurrencyCode}
            isEnabled={logic.enabledCurrencyCodes.includes(item.code)}
            onSelectDefault={logic.selectDefaultCurrency}
            onToggle={logic.toggleCurrency}
          />
        )}
      />

      <View
        style={[
          styles.footer,
          {
            backgroundColor: THEME.surfaceContainerLow,
            borderTopColor: THEME.outlineVariant,
          },
        ]}
      >
        <View style={styles.footerActions}>
          <AppButton
            {...SUBMIT_BTN_CONTENT_STYLE}
            icon="plus"
            variant={ButtonType.SECONDARY}
            disabled={logic.isSaving}
            style={styles.footerButton}
            onPress={logic.openPicker}
          >
            Add
          </AppButton>
          <AppButton
            {...SUBMIT_BTN_CONTENT_STYLE}
            disabled={logic.isSaving}
            loading={logic.isSaving}
            style={styles.footerButton}
            onPress={async () => {
              const isSaved = await logic.onSave();
              if (isSaved) router.back();
            }}
          >
            Save
          </AppButton>
        </View>
      </View>
    </AppView>
  );
}

const styles = StyleSheet.create({
  dialogButton: { borderRadius: 10, minWidth: 88 },
  dialogButtonContent: { height: 40, marginVertical: 0 },
  dialogButtonLabel: { fontSize: 15, marginHorizontal: 12 },
  header: {
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  summary: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    padding: 14,
  },
  summaryIcon: {
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
  },
  sectionTitle: {
    paddingHorizontal: 4,
  },
  listContent: {
    flexGrow: 1,
    padding: 12,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  footerActions: {
    flexDirection: "row",
    gap: 10,
  },
  footerButton: {
    borderRadius: 10,
    flex: 1,
  },
});
