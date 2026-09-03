import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  IconButton,
  Surface,
  Text,
} from "react-native-paper";
import AppDateRangePicker, {
  AppDateRangeValue,
} from "../../../components/AppDateRangePicker";
import AppIconButton from "../../../components/AppIconButton";
import AppPinVerificationDialog from "../../../components/AppPinVerificationDialog";
import { BUDGET_REMAINING_COLOR } from "../../../constants/colors";
import { DASHBOARD_SUMMARY_CARD_HEIGHT } from "../../../constants/size";
import { TRANSACTION_SEARCH_URL } from "../../../constants/urls";
import useSingleCurrencyMode from "../../../hook/currency_management/useSingleCurrencyMode";
import useAccountBalanceSummary from "../../../hook/dashboard/useAccountBalanceSummary";
import useAmountPrivacyToggle from "../../../hook/security/useAmountPrivacyToggle";
import { useTranslation } from "../../../i18n/helper";
import { useThemeStore } from "../../../stores/useThemeStore";
import { formatPrivateLocalizedAmount } from "../../../utils/number";

type AccountBalanceSummaryProps = {
  dateRange: AppDateRangeValue;
  startDate: string;
  endDate: string;
  onDateRangeChange: (range: AppDateRangeValue) => void;
};

export default function AccountBalanceSummary({
  dateRange,
  startDate,
  endDate,
  onDateRangeChange,
}: AccountBalanceSummaryProps) {
  const { isDark, THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const {
    areAmountsVisible,
    dismissPinDialog,
    isAuthenticating,
    isHydrated,
    isPinDialogVisible,
    toggleAmountsVisibility,
    verifyAppPin,
  } = useAmountPrivacyToggle();
  const {
    balance,
    canSelectNextCurrency,
    canSelectPreviousCurrency,
    currencyCode,
    expense,
    hasBudget,
    income,
    isBalanceLoading,
    isBudgetLoading,
    isBudgetOver,
    nextCurrency,
    previousCurrency,
    remainingBudget,
  } = useAccountBalanceSummary(startDate, endDate);
  const isSingleCurrency = useSingleCurrencyMode();
  const remainingBudgetColor = isBudgetOver
    ? THEME.error
    : isDark
      ? BUDGET_REMAINING_COLOR.dark
      : BUDGET_REMAINING_COLOR.light;
  const displayAmount = (amount: number) =>
    formatPrivateLocalizedAmount(
      amount,
      currencyCode,
      locale,
      areAmountsVisible,
    );

  return (
    <>
      <Surface
        elevation={1}
        style={[
          styles.container,
          { backgroundColor: THEME.surfaceContainerHigh },
        ]}
      >
        <View
          style={[
            styles.dateRangeContainer,
            { borderBottomColor: THEME.outlineVariant },
          ]}
        >
          <View style={styles.dateRangeRow}>
            <View style={styles.dateRangePicker}>
              <AppDateRangePicker
                label="Date Range"
                maxRangeDays={90}
                value={dateRange}
                onChange={onDateRangeChange}
              />
            </View>
            <View
              style={[
                styles.searchAction,
                { borderLeftColor: THEME.surfaceDim },
              ]}
            >
              <AppIconButton
                iconName="Search"
                iconSize={22}
                accessibilityRole="button"
                accessibilityLabel={t("Global Search")}
                onPress={() => router.push(TRANSACTION_SEARCH_URL)}
                hitSlop={8}
                style={{
                  ...styles.searchButton,
                  backgroundColor: THEME.surfaceContainerHigh,
                }}
              />
            </View>
          </View>
        </View>

        <View style={styles.balanceContainer}>
          <View
            style={[
              styles.balanceHeaderRow,
              isSingleCurrency && styles.singleCurrencyBalanceHeader,
            ]}
          >
            <View
              style={[
                styles.balanceValueContainer,
                isSingleCurrency && styles.singleCurrencyBalanceValue,
              ]}
            >
              <Text
                variant="labelLarge"
                style={{ color: THEME.onSurfaceVariant }}
              >
                {t("Balance")}
              </Text>
              {isBalanceLoading ? (
                <ActivityIndicator style={styles.loader} />
              ) : (
                <View
                  style={[
                    styles.balanceAmountRow,
                    isSingleCurrency && styles.singleCurrencyBalanceAmount,
                  ]}
                >
                  <Text
                    variant="headlineLarge"
                    adjustsFontSizeToFit
                    minimumFontScale={0.65}
                    numberOfLines={2}
                    style={styles.balanceAmount}
                  >
                    {displayAmount(balance)}
                  </Text>
                  <IconButton
                    icon={areAmountsVisible ? "eye" : "eye-off"}
                    size={20}
                    accessibilityLabel={
                      areAmountsVisible
                        ? t("Hide overview amounts")
                        : t("Show overview amounts")
                    }
                    accessibilityState={{ expanded: areAmountsVisible }}
                    disabled={
                      !isHydrated || isAuthenticating || isPinDialogVisible
                    }
                    iconColor={THEME.onSurfaceVariant}
                    style={styles.visibilityButton}
                    onPress={() => void toggleAmountsVisibility()}
                  />
                </View>
              )}
            </View>

            {!isSingleCurrency && (
              <View
                style={[
                  styles.currencyNavigator,
                  { backgroundColor: THEME.surfaceContainerHighest },
                ]}
              >
                <AppIconButton
                  iconName="ChevronLeft"
                  iconSize={20}
                  accessibilityLabel={t("Previous currency")}
                  disabled={!canSelectPreviousCurrency}
                  onPress={previousCurrency}
                  style={{
                    ...styles.currencyButton,
                    backgroundColor: THEME.surfaceContainerHighest,
                  }}
                />
                <View style={styles.currencyLabel}>
                  <Text
                    variant="labelSmall"
                    style={{ color: THEME.onSurfaceVariant }}
                  >
                    {t("Currency")}
                  </Text>
                  <Text variant="titleMedium" style={styles.currencyCode}>
                    {currencyCode}
                  </Text>
                </View>
                <AppIconButton
                  iconName="ChevronRight"
                  iconSize={20}
                  accessibilityLabel={t("Next currency")}
                  disabled={!canSelectNextCurrency}
                  onPress={nextCurrency}
                  style={{
                    ...styles.currencyButton,
                    backgroundColor: THEME.surfaceContainerHighest,
                  }}
                />
              </View>
            )}
          </View>

          <View style={styles.cashFlowRow}>
            <View style={styles.cashFlowItem}>
              <Text
                variant="labelSmall"
                style={{ color: THEME.onSurfaceVariant }}
              >
                {t("Expense")}
              </Text>
              <Text
                variant="titleMedium"
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                numberOfLines={2}
                style={[styles.cashFlowAmount, { color: THEME.error }]}
              >
                {displayAmount(expense)}
              </Text>
            </View>

            <View
              style={[
                styles.cashFlowDivider,
                { backgroundColor: THEME.outlineVariant },
              ]}
            />

            <View style={styles.cashFlowItem}>
              <Text
                variant="labelSmall"
                style={{ color: THEME.onSurfaceVariant }}
              >
                {t("Income")}
              </Text>
              <Text
                variant="titleMedium"
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                numberOfLines={2}
                style={[styles.cashFlowAmount, { color: THEME.primary }]}
              >
                {displayAmount(income)}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.budgetContainer,
            { borderTopColor: THEME.outlineVariant },
          ]}
        >
          <Text variant="labelMedium" style={{ color: THEME.onSurfaceVariant }}>
            {t(
              !hasBudget
                ? "Budget"
                : isBudgetOver
                  ? "Budget Over"
                  : "Budget Left",
            )}
          </Text>
          {isBudgetLoading ? (
            <ActivityIndicator size="small" style={styles.budgetLoader} />
          ) : !hasBudget ? (
            <Text
              variant="labelMedium"
              numberOfLines={2}
              style={{ ...styles.budgetAmount, fontSize: 16 }}
            >
              {t("No {{currency}} budget configured", {
                currency: currencyCode,
              })}
            </Text>
          ) : (
            <Text
              variant="titleMedium"
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              numberOfLines={2}
              style={[styles.budgetAmount, { color: remainingBudgetColor }]}
            >
              {displayAmount(remainingBudget)}
            </Text>
          )}
        </View>
      </Surface>
      <AppPinVerificationDialog
        visible={isPinDialogVisible}
        isVerifying={isAuthenticating}
        onDismiss={dismissPinDialog}
        onVerify={verifyAppPin}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginHorizontal: 12,
    marginVertical: 8,
    minHeight: DASHBOARD_SUMMARY_CARD_HEIGHT,
    overflow: "hidden",
  },
  dateRangeContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  dateRangeRow: { alignItems: "flex-start", flexDirection: "row" },
  dateRangePicker: { flex: 1, minWidth: 0 },
  searchAction: {
    alignItems: "center",
    borderLeftWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    marginBottom: 16,
    marginLeft: 4,
    paddingLeft: 6,
    paddingRight: 4,
  },
  searchButton: {
    alignItems: "center",
    height: 25,
    justifyContent: "center",
    width: 25,
  },
  currencyNavigator: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    flexShrink: 0,
    overflow: "hidden",
    paddingHorizontal: 2,
    paddingVertical: 3,
  },
  currencyButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    margin: 0,
    padding: 4,
    width: 40,
  },
  currencyLabel: { alignItems: "center", minWidth: 44 },
  currencyCode: { fontWeight: "700", lineHeight: 20, textAlign: "center" },
  balanceContainer: {
    flex: 1,
    justifyContent: "center",
    minHeight: 80,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  balanceHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  balanceValueContainer: {
    alignItems: "flex-start",
    flex: 1,
    minWidth: 0,
  },
  singleCurrencyBalanceHeader: { justifyContent: "center" },
  singleCurrencyBalanceValue: { alignItems: "center", flex: 0 },
  singleCurrencyBalanceAmount: { alignSelf: "center" },
  balanceAmountRow: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    maxWidth: "100%",
  },
  balanceAmount: {
    flexShrink: 1,
    fontWeight: "700",
    marginTop: 4,
    minWidth: 0,
  },
  cashFlowRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    maxWidth: 340,
    width: "100%",
  },
  cashFlowItem: {
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  cashFlowAmount: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 2,
    maxWidth: "100%",
    minWidth: 0,
    textAlign: "center",
    width: "100%",
  },
  cashFlowDivider: {
    height: 28,
    width: StyleSheet.hairlineWidth,
  },
  loader: {
    marginTop: 12,
  },
  visibilityButton: {
    height: 32,
    margin: 0,
    marginLeft: 4,
    marginTop: 4,
    width: 32,
  },
  budgetContainer: {
    display: "flex",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  budgetAmount: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 24,
    marginLeft: 8,
    maxWidth: "62%",
    minWidth: 0,
  },
  budgetLoader: {
    marginLeft: 8,
  },
});
