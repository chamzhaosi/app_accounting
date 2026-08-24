import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";
import AppDateRangePicker from "../../../components/AppDateRangePicker";
import AppFloatingButton from "../../../components/AppFloatingButton";
import AppSwipePager from "../../../components/AppSwipePager";
import AppView from "../../../components/AppView";
import { TRANSACTION_MANAGEMENT_CREATE_URL } from "../../../constants/urls";
import { ACCOUNT_DETAIL_CARD_HEIGHT } from "../../../constants/size";
import useAccountDetail from "../../../hook/account_management/useAccountDetail";
import { useThemeStore } from "../../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../../stores/useAmountPrivacyStore";
import TransactionManagementList from "../../transaction_management/list";
import { formatPrivateAmount } from "../../../utils/number";
import AccountBalanceHistoryChart from "./_components/AccountBalanceHistoryChart";
import { useTranslation } from "../../../i18n/helper";

export default function AccountDetail() {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const {
    account,
    dateRange,
    endDate,
    forwardBalance,
    id,
    isForwardBalanceLoading,
    isLoading,
    moneyIn,
    moneyOut,
    periodEndBalance,
    setDateRange,
    startDate,
  } = useAccountDetail();

  if (isLoading) {
    return (
      <View className="h-full items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
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
                {formatPrivateAmount(
                  account?.current_balance ?? 0,
                  areAmountsVisible,
                )}
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
                {formatPrivateAmount(forwardBalance, areAmountsVisible)}
              </Text>
            </View>
            <View style={styles.periodTotal}>
              <Text style={{ color: THEME.onSurfaceVariant }}>
                {t("Closing")}
              </Text>
              <Text style={styles.periodAmount}>
                {formatPrivateAmount(periodEndBalance, areAmountsVisible)}
              </Text>
            </View>
            <View style={styles.periodTotal}>
              <Text style={{ color: THEME.onSurfaceVariant }}>{t("Out")}</Text>
              <Text style={[styles.periodAmount, { color: THEME.error }]}>
                {formatPrivateAmount(moneyOut, areAmountsVisible)}
              </Text>
            </View>
            <View style={styles.periodTotal}>
              <Text style={{ color: THEME.onSurfaceVariant }}>{t("In")}</Text>
              <Text style={[styles.periodAmount, { color: THEME.primary }]}>
                {formatPrivateAmount(moneyIn, areAmountsVisible)}
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
