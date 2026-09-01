import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";
import AppIconButton from "../../../../components/AppIconButton";
import useAccountsBalanceSummary from "../../../../hook/account_management/useAccountsBalanceSummary";
import { useTranslation } from "../../../../i18n/helper";
import { useAmountPrivacyStore } from "../../../../stores/useAmountPrivacyStore";
import { useThemeStore } from "../../../../stores/useThemeStore";
import { formatPrivateLocalizedAmount } from "../../../../utils/number";

export default function AccountsBalanceSummary() {
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
    hasAccountCurrencies,
    isLoading,
    nextCurrency,
    previousCurrency,
  } = useAccountsBalanceSummary();

  return (
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
        ) : (
          <Text
            variant="headlineMedium"
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            numberOfLines={1}
            style={styles.balanceAmount}
          >
            {hasAccountCurrencies
              ? formatPrivateLocalizedAmount(
                  balance,
                  currencyCode,
                  locale,
                  areAmountsVisible,
                )
              : "—"}
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
          <Text variant="labelSmall" style={{ color: THEME.onSurfaceVariant }}>
            {t("Currency")}
          </Text>
          <Text variant="titleMedium" style={styles.currencyCode}>
            {hasAccountCurrencies ? currencyCode : "—"}
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
  );
}

const styles = StyleSheet.create({
  balanceAmount: { fontWeight: "700", marginTop: 4, maxWidth: "100%" },
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
});
