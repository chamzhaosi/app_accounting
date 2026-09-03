import { router, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  IconButton,
  Surface,
  Text,
} from "react-native-paper";
import AppDateRangePicker from "../../../components/AppDateRangePicker";
import AppCurrencyTotalsSheet from "../../../components/AppCurrencyTotalsSheet";
import AppFloatingButton from "../../../components/AppFloatingButton";
import AppIcon, { AppIconProps } from "../../../components/AppIcon";
import AppSwipePager from "../../../components/AppSwipePager";
import AppView from "../../../components/AppView";
import {
  CATEGORY_MANAGEMENT_DETAIL_URL,
  TRANSACTION_MANAGEMENT_CREATE_URL,
} from "../../../constants/urls";
import { CATEGORY_DETAIL_CARD_HEIGHT } from "../../../constants/size";
import useCategoryDetail from "../../../hook/category_management/useCategoryDetail";
import useSingleCurrencyMode from "../../../hook/currency_management/useSingleCurrencyMode";
import { useThemeStore } from "../../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../../stores/useAmountPrivacyStore";
import TransactionManagementList from "../../transaction_management/list";
import { formatPrivateLocalizedAmount } from "../../../utils/number";
import CategoryCumulativeChart from "./_components/CategoryCumulativeChart";
import { useTranslation } from "../../../i18n/helper";
import { getCategoryDisplayLabel } from "../../../hook/category_management/categoryManagementList.utils";
import CategoryCurrencyNavigator from "./_components/CategoryCurrencyNavigator";

export default function CategoryDetail() {
  const navigation = useNavigation();
  const { THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const isSingleCurrency = useSingleCurrencyMode();
  const {
    category,
    currencyCode,
    currencyCodes,
    currencyOptions,
    currencyTotalPreview,
    currencyTotals,
    dateRange,
    endDate,
    id,
    hiddenCurrencyTotalCount,
    isCurrencyTotalsVisible,
    isLoading,
    onCloseCurrencyTotals,
    onOpenCurrencyTotals,
    periodTotal,
    selectedCurrencyCode,
    setSelectedCurrencyCode,
    setDateRange,
    startDate,
    transactionCount,
    transactionType,
    typeLabel,
  } = useCategoryDetail();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="pencil-outline"
          iconColor={THEME.primary}
          accessibilityLabel={t("Edit category")}
          disabled={!category}
          onPress={() =>
            router.push({
              pathname: CATEGORY_MANAGEMENT_DETAIL_URL,
              params: { id },
            })
          }
        />
      ),
    });
  }, [THEME.primary, category, id, navigation, t]);

  if (isLoading) {
    return (
      <View className="h-full items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
      <AppCurrencyTotalsSheet
        title={t("Period Total")}
        subtitle={`${t("Date Range")}: ${startDate} – ${endDate}`}
        totals={currencyTotals.map((total) => ({
          amount: total.total_amount,
          currencyCode: total.currency_code,
        }))}
        visible={isCurrencyTotalsVisible}
        onDismiss={onCloseCurrencyTotals}
      />
      <AppSwipePager>
        <Surface
          elevation={1}
          style={[
            styles.summary,
            { backgroundColor: THEME.surfaceContainerHigh },
          ]}
        >
          <View style={styles.categoryHeading}>
            {category && (
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: THEME.surfaceContainerHighest },
                ]}
              >
                <AppIcon
                  name={category.icon as AppIconProps["name"]}
                  size={24}
                />
              </View>
            )}
            <View style={styles.categoryName}>
              <Text variant="titleLarge" numberOfLines={1}>
                {category
                  ? getCategoryDisplayLabel(
                      category.label,
                      category.translation_key,
                      t,
                    )
                  : t("Category unavailable")}
              </Text>
              {category && (
                <Text
                  variant="bodyMedium"
                  style={{ color: THEME.onSurfaceVariant }}
                >
                  {t(typeLabel)}
                </Text>
              )}
            </View>
            {!isSingleCurrency && (
              <CategoryCurrencyNavigator
                value={selectedCurrencyCode}
                options={currencyOptions}
                onChange={setSelectedCurrencyCode}
                style={styles.currencyNavigator}
              />
            )}
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
            <View style={styles.summaryItem}>
              <Text style={{ color: THEME.onSurfaceVariant }}>
                {t("Period Total")}
              </Text>
              <View style={styles.currencyTotals}>
                {currencyTotalPreview.length > 0 ? (
                  currencyTotalPreview.map((total) => (
                    <Text
                      key={total.currency_code}
                      style={[
                        styles.summaryAmount,
                        {
                          color:
                            category?.type_id === 1
                              ? THEME.primary
                              : THEME.error,
                        },
                      ]}
                    >
                      {`${isSingleCurrency ? "" : `${total.currency_code} `}${formatPrivateLocalizedAmount(
                        total.total_amount,
                        total.currency_code,
                        locale,
                        areAmountsVisible,
                      )}`}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.summaryAmount}>
                    {currencyCode
                      ? `${isSingleCurrency ? "" : `${currencyCode} `}${formatPrivateLocalizedAmount(
                          periodTotal,
                          currencyCode,
                          locale,
                          areAmountsVisible,
                        )}`
                      : "—"}
                  </Text>
                )}
                {hiddenCurrencyTotalCount > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("Open all currency totals")}
                    onPress={onOpenCurrencyTotals}
                    style={({ pressed }) => [
                      styles.moreTotalsButton,
                      { backgroundColor: THEME.surfaceContainerHighest },
                      pressed && styles.moreTotalsButtonPressed,
                    ]}
                  >
                    <Text
                      variant="labelLarge"
                      style={{ color: THEME.primary, fontWeight: "700" }}
                    >
                      +{hiddenCurrencyTotalCount}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            <View style={styles.summaryItem}>
              <Text style={{ color: THEME.onSurfaceVariant }}>
                {t("Transactions")}
              </Text>
              <Text style={styles.summaryAmount}>{transactionCount}</Text>
            </View>
          </View>
        </Surface>
        {category && currencyCode ? (
          <CategoryCumulativeChart
            categoryId={id}
            typeId={category.type_id}
            startDate={startDate}
            endDate={endDate}
            currencyCode={currencyCode}
          />
        ) : null}
      </AppSwipePager>

      {category && (
        <TransactionManagementList
          startDate={startDate}
          endDate={endDate}
          categoryId={id}
          currencyCode={currencyCode}
          currencyCodes={currencyCodes}
        />
      )}

      {category && (
        <AppFloatingButton
          icon="plus"
          accessibilityLabel={t("Add transaction for {{name}}", {
            name: getCategoryDisplayLabel(
              category.label,
              category.translation_key,
              t,
            ),
          })}
          onPress={() =>
            router.push({
              pathname: TRANSACTION_MANAGEMENT_CREATE_URL,
              params: {
                categoryId: id,
                transactionType,
              },
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
    minHeight: CATEGORY_DETAIL_CARD_HEIGHT,
    marginHorizontal: 12,
    marginVertical: 8,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  categoryHeading: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  categoryIcon: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    marginRight: 12,
    width: 44,
  },
  categoryName: {
    flex: 1,
    minWidth: 0,
  },
  currencyNavigator: {
    marginLeft: 8,
  },
  summaryRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  currencyTotals: {
    alignItems: "center",
    justifyContent: "center",
  },
  moreTotalsButton: {
    borderRadius: 12,
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  moreTotalsButtonPressed: { opacity: 0.7 },
});
