import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";
import AppDateRangePicker from "../../../components/AppDateRangePicker";
import AppFloatingButton from "../../../components/AppFloatingButton";
import AppIcon, { AppIconProps } from "../../../components/AppIcon";
import AppSwipePager from "../../../components/AppSwipePager";
import AppView from "../../../components/AppView";
import { TRANSACTION_MANAGEMENT_CREATE_URL } from "../../../constants/urls";
import { CATEGORY_DETAIL_CARD_HEIGHT } from "../../../constants/size";
import useCategoryDetail from "../../../hook/category_management/useCategoryDetail";
import { useThemeStore } from "../../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../../stores/useAmountPrivacyStore";
import TransactionManagementList from "../../transaction_management/list";
import { formatPrivateAmount } from "../../../utils/number";
import CategoryCumulativeChart from "./_components/CategoryCumulativeChart";
import { useTranslation } from "../../../i18n/helper";
import { getCategoryDisplayLabel } from "../../../hook/category_management/categoryManagementList.utils";

export default function CategoryDetail() {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const {
    category,
    dateRange,
    endDate,
    id,
    isLoading,
    periodTotal,
    setDateRange,
    startDate,
    transactionCount,
    transactionType,
    typeLabel,
  } = useCategoryDetail();

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
              <Text
                style={[
                  styles.summaryAmount,
                  {
                    color:
                      category?.type_id === 1 ? THEME.primary : THEME.error,
                  },
                ]}
              >
                {formatPrivateAmount(periodTotal, areAmountsVisible)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={{ color: THEME.onSurfaceVariant }}>
                {t("Transactions")}
              </Text>
              <Text style={styles.summaryAmount}>{transactionCount}</Text>
            </View>
          </View>
        </Surface>
        {category ? (
          <CategoryCumulativeChart
            categoryId={id}
            typeId={category.type_id}
            startDate={startDate}
            endDate={endDate}
          />
        ) : null}
      </AppSwipePager>

      {category && (
        <TransactionManagementList
          startDate={startDate}
          endDate={endDate}
          categoryId={id}
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
    height: CATEGORY_DETAIL_CARD_HEIGHT,
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
});
