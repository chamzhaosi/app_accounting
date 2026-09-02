import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";
import AppCurrencyTotalsSheet from "../../../../components/AppCurrencyTotalsSheet";
import AppIconButton from "../../../../components/AppIconButton";
import useAccountsBalanceSummary from "../../../../hook/account_management/useAccountsBalanceSummary";
import { useTranslation } from "../../../../i18n/helper";
import { useAmountPrivacyStore } from "../../../../stores/useAmountPrivacyStore";
import { useThemeStore } from "../../../../stores/useThemeStore";
import {
  formatPrivateCurrencyAmount,
  formatPrivateLocalizedAmount,
} from "../../../../utils/number";

const MAX_VISIBLE_CURRENCY_TOTALS = 3;

type Props = {
  selectedCurrencyCode: string | null;
  onSelectedCurrencyChange: (currencyCode: string | null) => void;
};

export default function AccountsBalanceSummary({
  selectedCurrencyCode,
  onSelectedCurrencyChange,
}: Props) {
  const [showAllBalances, setShowAllBalances] = useState(false);
  const { THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const {
    balance,
    canSelectNextCurrency,
    canSelectPreviousCurrency,
    currencyCode,
    currencyTotals,
    hasAccountCurrencies,
    isAllCurrencies,
    isLoading,
    nextCurrency,
    previousCurrency,
  } = useAccountsBalanceSummary({
    selectedCurrencyCode,
    onSelectedCurrencyChange,
  });

  const hiddenCurrencyCount = Math.max(
    currencyTotals.length - MAX_VISIBLE_CURRENCY_TOTALS,
    0,
  );

  return (
    <>
      <AppCurrencyTotalsSheet
        title={t("Balance")}
        subtitle={t("Balance by currency")}
        totals={currencyTotals}
        visible={showAllBalances}
        onDismiss={() => setShowAllBalances(false)}
      />
      <Surface
        elevation={1}
        style={[
          styles.container,
          { backgroundColor: THEME.surfaceContainerHigh },
        ]}
      >
        <View style={styles.balanceContainer}>
          <Text variant="labelLarge" style={{ color: THEME.onSurfaceVariant }}>
            {t("Balance")}
          </Text>
          {isLoading ? (
            <ActivityIndicator style={styles.loader} />
          ) : !hasAccountCurrencies ? (
            <Text variant="headlineMedium" style={styles.balanceAmount}>
              —
            </Text>
          ) : isAllCurrencies ? (
            <View style={styles.allBalances}>
              {currencyTotals
                .slice(0, MAX_VISIBLE_CURRENCY_TOTALS)
                .map((total) => (
                  <Text
                    key={total.currencyCode}
                    variant="titleMedium"
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    numberOfLines={1}
                    style={styles.currencyBalanceAmount}
                  >
                    {formatPrivateCurrencyAmount(
                      total.amount,
                      total.currencyCode,
                      locale,
                      areAmountsVisible,
                    )}
                  </Text>
                ))}
              {hiddenCurrencyCount > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("+{{count}} more", {
                    count: hiddenCurrencyCount,
                  })}
                  onPress={() => setShowAllBalances(true)}
                  hitSlop={8}
                >
                  <Text
                    variant="labelLarge"
                    style={[styles.moreBalances, { color: THEME.primary }]}
                  >
                    (+{hiddenCurrencyCount})
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <Text
              variant="headlineMedium"
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              numberOfLines={1}
              style={styles.balanceAmount}
            >
              {formatPrivateLocalizedAmount(
                balance,
                currencyCode!,
                locale,
                areAmountsVisible,
              )}
            </Text>
          )}
        </View>

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
              {hasAccountCurrencies
                ? isAllCurrencies
                  ? t("All")
                  : currencyCode
                : "—"}
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
      </Surface>
    </>
  );
}

const styles = StyleSheet.create({
  balanceAmount: { fontWeight: "700", marginTop: 4, maxWidth: "100%" },
  allBalances: { alignItems: "flex-start", marginTop: 4 },
  balanceContainer: { flex: 1, minWidth: 0 },
  container: {
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "row",
    marginHorizontal: 12,
    marginVertical: 8,
    minHeight: 112,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  currencyButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    margin: 0,
    padding: 4,
    width: 40,
  },
  currencyCode: { fontWeight: "700", lineHeight: 20, textAlign: "center" },
  currencyBalanceAmount: { fontWeight: "700", maxWidth: "100%" },
  currencyLabel: { alignItems: "center", minWidth: 44 },
  currencyNavigator: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    flexShrink: 0,
    marginLeft: 12,
    overflow: "hidden",
    paddingHorizontal: 2,
    paddingVertical: 3,
  },
  loader: { alignSelf: "flex-start", marginTop: 12 },
  moreBalances: { fontWeight: "700", marginTop: 2 },
});
