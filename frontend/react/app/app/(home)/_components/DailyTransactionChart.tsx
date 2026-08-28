import { StyleSheet, useWindowDimensions, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import {
  ActivityIndicator,
  IconButton,
  Surface,
  Text,
} from "react-native-paper";
import { BUDGET_REMAINING_COLOR } from "../../../constants/colors";
import { DASHBOARD_SUMMARY_CARD_HEIGHT } from "../../../constants/size";
import useDailyTransactionChart from "../../../hook/dashboard/useDailyTransactionChart";
import useSingleCurrencyMode from "../../../hook/currency_management/useSingleCurrencyMode";
import type { ChartPoint } from "../../../hook/dashboard/useDailyTransactionChart";
import { useThemeStore } from "../../../stores/useThemeStore";
import { useAmountPrivacyStore } from "../../../stores/useAmountPrivacyStore";
import {
  formatPrivateCompactAmount,
  formatPrivateCurrencyAmount,
} from "../../../utils/number";
import { useTranslation } from "../../../i18n/helper";

type DailyTransactionChartProps = {
  startDate: string;
  endDate: string;
};

export default function DailyTransactionChart({
  startDate,
  endDate,
}: DailyTransactionChartProps) {
  const { width } = useWindowDimensions();
  const { isDark, THEME } = useThemeStore();
  const { locale, t } = useTranslation();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const {
    budgetPaceData,
    currencyCode,
    dateRangeLabel,
    expenseData,
    incomeData,
    isCumulative,
    isLoading,
    maximum,
    mode,
    setMode,
    showBudgetPace,
  } = useDailyTransactionChart(startDate, endDate);
  const expenseColor = isDark ? "#FF6B6B" : "#C62828";
  const incomeColor = isDark ? "#4ADE80" : "#16803D";
  const budgetColor = isDark
    ? BUDGET_REMAINING_COLOR.dark
    : BUDGET_REMAINING_COLOR.light;

  const chartWidth = Math.max(width - 96, 220);
  const horizontalInset = 16;
  const spacing =
    incomeData.length > 1
      ? (chartWidth - horizontalInset * 2) / (incomeData.length - 1)
      : chartWidth;

  return (
    <Surface
      elevation={1}
      style={[
        styles.container,
        { backgroundColor: THEME.surfaceContainerHighest },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="titleMedium" style={styles.title}>
            {t("Cash flow")} · {currencyCode}
          </Text>
          <Text variant="labelSmall" style={{ color: THEME.onSurfaceVariant }}>
            {dateRangeLabel}
          </Text>
        </View>
        <View
          style={[styles.modeToggle, { borderColor: THEME.outlineVariant }]}
        >
          <IconButton
            icon="calendar-today"
            size={18}
            accessibilityLabel={t("Daily chart")}
            selected={mode === "daily"}
            iconColor={
              mode === "daily"
                ? THEME.onPrimaryContainer
                : THEME.onSurfaceVariant
            }
            containerColor={
              mode === "daily" ? THEME.primaryContainer : "transparent"
            }
            style={styles.modeButton}
            onPress={() => setMode("daily")}
          />
          <IconButton
            icon="chart-line"
            size={18}
            accessibilityLabel={t("Cumulative chart")}
            selected={mode === "cumulative"}
            iconColor={
              mode === "cumulative"
                ? THEME.onPrimaryContainer
                : THEME.onSurfaceVariant
            }
            containerColor={
              mode === "cumulative" ? THEME.primaryContainer : "transparent"
            }
            style={styles.modeButton}
            onPress={() => setMode("cumulative")}
          />
        </View>
      </View>
      <View style={styles.legend}>
        <LegendItem color={expenseColor} label="Expense" />
        <LegendItem color={incomeColor} label="Income" />
        {showBudgetPace ? (
          <LegendItem color={budgetColor} label="Budget pace" />
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <LineChart
            data={expenseData}
            data2={incomeData}
            data3={showBudgetPace ? budgetPaceData : undefined}
            width={chartWidth}
            height={145}
            maxValue={maximum}
            stepValue={maximum / 4}
            spacing={spacing}
            initialSpacing={horizontalInset}
            endSpacing={horizontalInset}
            color1={expenseColor}
            color2={incomeColor}
            color3={budgetColor}
            thickness1={2.5}
            thickness2={2.5}
            thickness3={2.5}
            strokeLinecap1="butt"
            strokeLinecap2="butt"
            strokeLinecap3="butt"
            hideDataPoints1
            hideDataPoints2
            hideDataPoints3
            areaChart1={!isCumulative}
            areaChart2={!isCumulative}
            startFillColor1={expenseColor}
            endFillColor1={expenseColor}
            startOpacity1={0.18}
            endOpacity1={0.01}
            startFillColor2={incomeColor}
            endFillColor2={incomeColor}
            startOpacity2={0.16}
            endOpacity2={0.01}
            isAnimated
            animateTogether
            animationDuration={650}
            disableScroll
            noOfSections={4}
            yAxisLabelWidth={44}
            yAxisColor={THEME.outline}
            yAxisThickness={StyleSheet.hairlineWidth}
            xAxisColor={THEME.outlineVariant}
            xAxisThickness={StyleSheet.hairlineWidth}
            rulesType="dashed"
            dashWidth={4}
            dashGap={6}
            rulesColor={isDark ? "#3F484B" : "#CDD5D7"}
            yAxisTextStyle={{
              color: THEME.onSurface,
              fontSize: 11,
              fontWeight: "500",
            }}
            xAxisLabelTextStyle={{
              color: THEME.onSurfaceVariant,
              fontSize: 10,
              marginLeft: (spacing - 32) / 2,
              width: 32,
            }}
            xAxisLabelsHeight={22}
            formatYLabel={(label) =>
              formatPrivateCompactAmount(label, areAmountsVisible)
            }
            pointerConfig={{
              pointer1Color: expenseColor,
              pointer2Color: incomeColor,
              pointer3Color: budgetColor,
              pointerStripColor: THEME.outlineVariant,
              pointerStripWidth: 1,
              pointerStripUptoDataPoint: true,
              radius: 4,
              activatePointersOnLongPress: true,
              autoAdjustPointerLabelPosition: true,
              pointerLabelWidth: 148,
              pointerLabelHeight: showBudgetPace ? 102 : 82,
              pointerLabelComponent: (items: ChartPoint[]) => (
                <View
                  style={[
                    styles.tooltip,
                    { backgroundColor: THEME.inverseSurface },
                  ]}
                >
                  <Text
                    variant="labelSmall"
                    style={{ color: THEME.inverseOnSurface }}
                  >
                    {items[0]?.date}
                  </Text>
                  <TooltipValue
                    color={expenseColor}
                    label="Expense"
                    value={items[0]?.value ?? 0}
                    textColor={THEME.inverseOnSurface}
                    areAmountsVisible={areAmountsVisible}
                    currencyCode={currencyCode}
                    locale={locale}
                  />
                  <TooltipValue
                    color={incomeColor}
                    label="Income"
                    value={items[1]?.value ?? 0}
                    textColor={THEME.inverseOnSurface}
                    areAmountsVisible={areAmountsVisible}
                    currencyCode={currencyCode}
                    locale={locale}
                  />
                  {showBudgetPace ? (
                    <TooltipValue
                      color={budgetColor}
                      label="Budget pace"
                      value={items[2]?.value ?? 0}
                      textColor={THEME.inverseOnSurface}
                      areAmountsVisible={areAmountsVisible}
                      currencyCode={currencyCode}
                      locale={locale}
                    />
                  ) : null}
                </View>
              ),
            }}
          />
        </View>
      )}
    </Surface>
  );
}

function TooltipValue({
  color,
  label,
  value,
  textColor,
  areAmountsVisible,
  currencyCode,
  locale,
}: {
  color: string;
  label: string;
  value: number;
  textColor: string;
  areAmountsVisible: boolean;
  currencyCode: string;
  locale: string;
}) {
  const { t } = useTranslation();
  const isSingleCurrency = useSingleCurrencyMode();
  return (
    <View style={styles.tooltipRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text variant="labelSmall" style={{ color: textColor }}>
        {t(label)}
      </Text>
      <Text
        variant="labelSmall"
        style={[styles.tooltipAmount, { color: textColor }]}
      >
        {formatPrivateCurrencyAmount(
          value,
          currencyCode,
          locale,
          areAmountsVisible,
          !isSingleCurrency,
        )}
      </Text>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text variant="labelSmall">{t(label)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    height: DASHBOARD_SUMMARY_CARD_HEIGHT,
    marginHorizontal: 12,
    marginVertical: 8,
    overflow: "hidden",
    paddingBottom: 0,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  chartContainer: { marginTop: 6 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  headerText: { flexShrink: 1 },
  legend: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginBottom: 6,
  },
  legendDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  loadingContainer: {
    alignItems: "center",
    height: 165,
    justifyContent: "center",
  },
  modeButton: { height: 30, margin: 0, width: 34 },
  modeToggle: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 34,
    padding: 1,
    width: 72,
  },
  title: {
    fontWeight: "700",
  },
  tooltip: {
    borderRadius: 12,
    elevation: 4,
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 148,
  },
  tooltipAmount: {
    fontWeight: "700",
    marginLeft: "auto",
  },
  tooltipRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
});
