import { router } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, List, Surface, Text } from "react-native-paper";
import AppButton, { ButtonType } from "../../components/AppButton";
import AppDialog from "../../components/AppDialog";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppIcon from "../../components/AppIcon";
import AppView from "../../components/AppView";
import { BUDGET_MANAGEMENT_CREATE_URL } from "../../constants/urls";
import useBudgetPlanList from "../../hook/budget_management/useBudgetPlanList";
import useSingleCurrencyMode from "../../hook/currency_management/useSingleCurrencyMode";
import { useTranslation } from "../../i18n/helper";
import { useAmountPrivacyStore } from "../../stores/useAmountPrivacyStore";
import { useThemeStore } from "../../stores/useThemeStore";
import {
  formatPrivateCurrencyAmount,
  formatPrivateLocalizedAmount,
} from "../../utils/number";

export default function BudgetPlanList() {
  const logic = useBudgetPlanList();
  const { locale, t } = useTranslation();
  const { THEME } = useThemeStore();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const isSingleCurrency = useSingleCurrencyMode();

  if (logic.isLoading) {
    return (
      <AppView className="items-center justify-center">
        <ActivityIndicator size="large" />
      </AppView>
    );
  }

  return (
    <AppView className="relative bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
      <AppDialog
        title="Currency disabled"
        description="Enable {{currency}} in Currency Management before editing or reactivating this budget."
        descriptionValues={{ currency: logic.lockedCurrencyCode ?? "" }}
        highlightedDescriptionValue={logic.lockedCurrencyCode}
        showDialog={Boolean(logic.lockedCurrencyCode)}
        onDismiss={logic.dismissLockedDialog}
        actionRender={
          <>
            <AppButton
              variant={ButtonType.SECONDARY}
              style={styles.dialogButton}
              contentStyle={styles.dialogButtonContent}
              labelStyle={styles.dialogButtonLabel}
              onPress={logic.dismissLockedDialog}
            >
              Close
            </AppButton>
            <AppButton
              style={styles.dialogButton}
              contentStyle={styles.dialogButtonContent}
              labelStyle={styles.dialogButtonLabel}
              onPress={logic.onOpenCurrencyManagement}
            >
              Manage currencies
            </AppButton>
          </>
        }
      />

      {!logic.canCreate && (
        <Surface
          elevation={0}
          style={[styles.notice, { backgroundColor: THEME.secondaryContainer }]}
        >
          <AppIcon name="CircleCheck" size={20} />
          <Text variant="bodyMedium">
            {t("All enabled currencies already have a budget.")}
          </Text>
        </Surface>
      )}

      <FlatList
        data={logic.plans}
        keyExtractor={(item) => item.plan_id}
        refreshing={logic.isRefetching}
        onRefresh={() => void logic.onRefresh()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppIcon
              name="HandCoins"
              size={64}
              color={THEME.onSurfaceVariant}
            />
            <Text variant="titleLarge">{t("No budgets yet")}</Text>
            <Text
              variant="bodyMedium"
              style={{ color: THEME.onSurfaceVariant }}
            >
              {t(
                "Create a recurring monthly budget for one of your currencies.",
              )}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = !item.is_currency_enabled
            ? "Currency disabled"
            : item.is_active
              ? "Active"
              : "Inactive";
          const statusColor = !item.is_currency_enabled
            ? THEME.warning
            : item.is_active
              ? THEME.success
              : THEME.outline;

          return (
            <List.Item
              title={formatPrivateCurrencyAmount(
                item.total_budget,
                item.currency_code,
                locale,
                areAmountsVisible,
                !isSingleCurrency,
              )}
              description={t(
                "{{count}} categories · {{currency}} {{amount}} allocated",
                {
                  count: item.allocation_count,
                  currency: isSingleCurrency ? "" : item.currency_code,
                  amount: formatPrivateLocalizedAmount(
                    item.allocated_amount,
                    item.currency_code,
                    locale,
                    areAmountsVisible,
                  ),
                },
              ).replace(/\s+/g, " ")}
              onPress={() => logic.onPressPlan(item)}
              style={[styles.item, { backgroundColor: THEME.surfaceContainer }]}
              left={() => (
                <View style={styles.itemIcon}>
                  <AppIcon
                    name={
                      item.is_currency_enabled ? "WalletCards" : "LockKeyhole"
                    }
                  />
                </View>
              )}
              right={() => (
                <View style={styles.itemRight}>
                  <View
                    style={[styles.statusDot, { backgroundColor: statusColor }]}
                  />
                  <Text variant="labelMedium" style={{ color: statusColor }}>
                    {t(status)}
                  </Text>
                  <AppIcon
                    name="ChevronRight"
                    size={20}
                    color={THEME.onSurfaceVariant}
                  />
                </View>
              )}
            />
          );
        }}
      />

      <AppFloatingButton
        icon="plus"
        disabled={!logic.canCreate}
        accessibilityLabel={t("Create budget")}
        onPress={() => router.push(BUDGET_MANAGEMENT_CREATE_URL)}
      />
    </AppView>
  );
}

const styles = StyleSheet.create({
  dialogButton: { borderRadius: 10 },
  dialogButtonContent: { height: 40, marginVertical: 0 },
  dialogButtonLabel: { fontSize: 14, marginHorizontal: 10 },
  listContent: { flexGrow: 1, paddingBottom: 96 },
  item: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 8 },
  itemIcon: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingLeft: 8,
  },
  itemRight: { alignItems: "center", flexDirection: "row", gap: 6 },
  statusDot: { borderRadius: 5, height: 10, width: 10 },
  notice: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    margin: 12,
    padding: 12,
  },
  empty: {
    alignItems: "center",
    flex: 1,
    gap: 8,
    justifyContent: "center",
    padding: 32,
  },
});
