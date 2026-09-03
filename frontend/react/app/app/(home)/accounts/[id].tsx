import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import {
  ActivityIndicator,
  IconButton,
  Surface,
  Text,
} from "react-native-paper";
import { TabBar, TabBarProps, TabView } from "react-native-tab-view";
import AppDateRangePicker from "../../../components/AppDateRangePicker";
import AppFloatingButton from "../../../components/AppFloatingButton";
import AppSwipePager from "../../../components/AppSwipePager";
import AppView from "../../../components/AppView";
import {
  ACCOUNT_MANAGEMENT_DETAIL_URL,
  TRANSACTION_MANAGEMENT_CREATE_URL,
} from "../../../constants/urls";
import { ACCOUNT_DETAIL_CARD_HEIGHT } from "../../../constants/size";
import useAccountDetail from "../../../hook/account_management/useAccountDetail";
import useSingleCurrencyMode from "../../../hook/currency_management/useSingleCurrencyMode";
import { useThemeStore } from "../../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../../stores/useAmountPrivacyStore";
import TransactionManagementList from "../../transaction_management/list";
import {
  formatPrivateCurrencyAmount,
  formatPrivateLocalizedAmount,
} from "../../../utils/number";
import { DEFAULT_CURRENCY_CODE } from "../../../constants/currencies";
import AccountBalanceHistoryChart from "./_components/AccountBalanceHistoryChart";
import { useTranslation } from "../../../i18n/helper";
import CreditCardCycleCard from "./_components/CreditCardCycleCard";
import AppDialog from "../../../components/AppDialog";
import AppButton, { ButtonType } from "../../../components/AppButton";
import { DIALOG_COMMON_BTN_PROPS } from "../../../constants/size";
import { formatDateValue } from "../../../utils/date";

type AccountDetailTabRoute = {
  key: "summary" | "statement";
  title: string;
};

const ACCOUNT_DETAIL_TAB_ROUTES: AccountDetailTabRoute[] = [
  { key: "summary", title: "Summary" },
  { key: "statement", title: "Statement" },
];

export default function AccountDetail() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const navigation = useNavigation();
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [tabIndex, setTabIndex] = useState(tab === "statement" ? 1 : 0);
  const layout = useWindowDimensions();
  const { THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const {
    account,
    creditCardCycle,
    dateRange,
    endDate,
    forwardBalance,
    id,
    isForwardBalanceLoading,
    isCreditCard,
    isLoading,
    moneyIn,
    moneyOut,
    notificationsAvailable,
    periodEndBalance,
    setDateRange,
    toggleCycleSkipped,
    startDate,
  } = useAccountDetail();
  const currencyCode = account?.currency_code ?? DEFAULT_CURRENCY_CODE;
  const isSingleCurrency = useSingleCurrencyMode();
  const today = formatDateValue(new Date());

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="pencil-outline"
          iconColor={THEME.primary}
          accessibilityLabel={t("Edit account")}
          disabled={!account}
          onPress={() =>
            router.push({
              pathname: ACCOUNT_MANAGEMENT_DETAIL_URL,
              params: { id },
            })
          }
        />
      ),
    });
  }, [THEME.primary, account, id, navigation, t]);

  useEffect(() => {
    if (tab === "statement") setTabIndex(1);
    if (tab === "summary") setTabIndex(0);
  }, [tab]);
  const displayAmount = (value: number, showCurrencyCode?: boolean) =>
    showCurrencyCode
      ? formatPrivateCurrencyAmount(
          value,
          currencyCode,
          locale,
          areAmountsVisible,
          !isSingleCurrency,
        )
      : formatPrivateLocalizedAmount(
          value,
          currencyCode,
          locale,
          areAmountsVisible,
        );

  if (isLoading) {
    return (
      <View className="h-full items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderTabBar = (props: TabBarProps<AccountDetailTabRoute>) => (
    <TabBar
      {...props}
      activeColor={THEME.primary}
      inactiveColor={THEME.onSurfaceVariant}
      indicatorStyle={[styles.tabIndicator, { backgroundColor: THEME.primary }]}
      style={{ backgroundColor: THEME.surfaceContainerHigh }}
    />
  );

  const renderSummaryTab = () => (
    <View style={styles.scene}>
      <AppSwipePager>
        <Surface
          elevation={1}
          style={[
            styles.summary,
            { backgroundColor: THEME.surfaceContainerHigh },
          ]}
        >
          <View style={styles.accountHeading}>
            <View style={styles.accountName}>
              <Text variant="titleLarge" numberOfLines={1}>
                {account?.label ?? t("Account unavailable")}
              </Text>
              {account && (
                <Text
                  variant="bodyMedium"
                  style={{ color: THEME.onSurfaceVariant }}
                >
                  {t(account.type_label)}
                </Text>
              )}
            </View>
            <View style={styles.balance}>
              <Text
                variant="labelMedium"
                style={{ color: THEME.onSurfaceVariant }}
              >
                {t("Current Balance")}
              </Text>
              <Text variant="titleLarge" style={styles.balanceAmount}>
                {displayAmount(account?.current_balance ?? 0, true)}
              </Text>
            </View>
          </View>

          <AppDateRangePicker
            label="Date Range"
            maxRangeDays={90}
            value={dateRange}
            onChange={setDateRange}
          />

          <View
            style={[
              styles.summaryRow,
              { borderTopColor: THEME.outlineVariant },
            ]}
          >
            <View style={styles.periodTotal}>
              <Text style={{ color: THEME.onSurfaceVariant }}>
                {t("Opening")}
              </Text>
              <Text style={styles.periodAmount}>
                {displayAmount(forwardBalance)}
              </Text>
            </View>
            <View style={styles.periodTotal}>
              <Text style={{ color: THEME.onSurfaceVariant }}>
                {t("Closing")}
              </Text>
              <Text style={styles.periodAmount}>
                {displayAmount(periodEndBalance)}
              </Text>
            </View>
            <View style={styles.periodTotal}>
              <Text style={{ color: THEME.onSurfaceVariant }}>{t("Out")}</Text>
              <Text style={[styles.periodAmount, { color: THEME.error }]}>
                {displayAmount(moneyOut)}
              </Text>
            </View>
            <View style={styles.periodTotal}>
              <Text style={{ color: THEME.onSurfaceVariant }}>{t("In")}</Text>
              <Text style={[styles.periodAmount, { color: THEME.primary }]}>
                {displayAmount(moneyIn)}
              </Text>
            </View>
          </View>
        </Surface>
        {account ? (
          <AccountBalanceHistoryChart
            accountId={id}
            startDate={startDate}
            endDate={endDate}
            forwardBalance={forwardBalance}
            isForwardBalanceLoading={isForwardBalanceLoading}
          />
        ) : null}
      </AppSwipePager>

      {account && (
        <TransactionManagementList
          startDate={startDate}
          endDate={endDate}
          accountId={id}
        />
      )}
    </View>
  );

  const renderStatementTab = () => (
    <View style={styles.scene}>
      {account && creditCardCycle && (
        <>
          <CreditCardCycleCard
            cycle={creditCardCycle}
            currencyCode={currencyCode}
            reminderLeadDays={account.reminder_lead_days ?? 3}
            reminderTime={account.reminder_time ?? "09:00"}
            onToggleSkipped={() =>
              creditCardCycle.is_skipped
                ? void toggleCycleSkipped()
                : setShowSkipDialog(true)
            }
            notificationsAvailable={notificationsAvailable}
          />
          <TransactionManagementList
            startDate={creditCardCycle.period_start}
            endDate={today}
            accountId={id}
            creditCardStatementDate={creditCardCycle.statement_date}
          />
        </>
      )}
    </View>
  );

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
      <AppDialog
        title="Skip this cycle?"
        description="This will not mark the statement as paid. Reminders resume automatically for the next cycle."
        showDialog={showSkipDialog}
        onDismiss={() => setShowSkipDialog(false)}
        actionRender={
          <>
            <AppButton
              {...DIALOG_COMMON_BTN_PROPS}
              variant={ButtonType.SECONDARY}
              shouldTranslateText={false}
              onPress={() => setShowSkipDialog(false)}
            >
              {t("Cancel")}
            </AppButton>
            <AppButton
              {...DIALOG_COMMON_BTN_PROPS}
              shouldTranslateText={false}
              onPress={() => {
                setShowSkipDialog(false);
                void toggleCycleSkipped();
              }}
            >
              {t("Skip")}
            </AppButton>
          </>
        }
      />
      {account && isCreditCard && creditCardCycle ? (
        <TabView
          style={styles.tabView}
          renderTabBar={renderTabBar}
          navigationState={{
            index: tabIndex,
            routes: ACCOUNT_DETAIL_TAB_ROUTES.map((route) => ({
              ...route,
              title: t(route.title),
            })),
          }}
          renderScene={({ route }) =>
            route.key === "summary" ? renderSummaryTab() : renderStatementTab()
          }
          onIndexChange={setTabIndex}
          initialLayout={{ width: layout.width }}
        />
      ) : (
        renderSummaryTab()
      )}

      {account && (
        <AppFloatingButton
          icon="plus"
          accessibilityLabel={t("Add transaction for {{name}}", {
            name: account.label,
          })}
          onPress={() =>
            router.push({
              pathname: TRANSACTION_MANAGEMENT_CREATE_URL,
              params: { accountId: id },
            })
          }
        />
      )}
    </AppView>
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1 },
  tabView: { flex: 1 },
  tabIndicator: { height: 3 },
  summary: {
    borderRadius: 20,
    height: ACCOUNT_DETAIL_CARD_HEIGHT,
    marginHorizontal: 12,
    marginVertical: 8,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  accountHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  accountName: {
    flex: 1,
    marginRight: 16,
  },
  balance: {
    alignItems: "flex-end",
  },
  balanceAmount: {
    fontWeight: "700",
    marginTop: 2,
  },
  summaryRow: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flex: 1,
    flexDirection: "row",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  periodTotal: {
    alignItems: "center",
    flex: 1,
  },
  periodAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
});
