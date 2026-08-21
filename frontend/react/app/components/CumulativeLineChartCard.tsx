import { StyleSheet, useWindowDimensions, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { ActivityIndicator, Surface, Text } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";
import { useAmountPrivacyStore } from "../stores/useAmountPrivacyStore";
import { MASKED_AMOUNT } from "../utils/number";

export type CumulativeChartPoint = {
  value: number;
  label: string;
  date: string;
};

type CumulativeLineChartCardProps = {
  title: string;
  seriesLabel: string;
  data: CumulativeChartPoint[];
  color: string;
  cardHeight: number;
  isLoading: boolean;
};

const formatAxisAmount = (amount: number) => {
  const absoluteAmount = Math.abs(amount);
  if (absoluteAmount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}m`;
  if (absoluteAmount >= 1_000) return `${(amount / 1_000).toFixed(1)}k`;
  return amount.toFixed(0);
};

const roundAxisValue = (value: number) => Math.ceil(value / 20) * 20;

export default function CumulativeLineChartCard({
  title,
  seriesLabel,
  data,
  color,
  cardHeight,
  isLoading,
}: CumulativeLineChartCardProps) {
  const { width } = useWindowDimensions();
  const { isDark, THEME } = useThemeStore();
  const areAmountsVisible = useAmountPrivacyStore(
    (state) => state.areAmountsVisible,
  );
  const chartWidth = Math.max(width - 96, 220);
  const horizontalInset = 16;
  const spacing =
    data.length > 1
      ? (chartWidth - horizontalInset * 2) / (data.length - 1)
      : chartWidth;
  const maximum = Math.max(
    roundAxisValue(Math.max(...data.map((item) => item.value), 0)),
    20,
  );
  const minimum = Math.min(...data.map((item) => item.value), 0);
  const chartHeight = Math.max(cardHeight - 100, 100);

  return (
    <Surface
      elevation={1}
      style={[
        styles.container,
        {
          backgroundColor: THEME.surfaceContainerHigh,
          height: cardHeight,
        },
      ]}
    >
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: color }]} />
          <Text variant="labelSmall">{seriesLabel}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      ) : (
        <LineChart
          data={data}
          width={chartWidth}
          height={chartHeight}
          maxValue={maximum}
          mostNegativeValue={minimum}
          stepValue={maximum / 4}
          spacing={spacing}
          initialSpacing={horizontalInset}
          endSpacing={horizontalInset}
          color={color}
          thickness={2.5}
          strokeLinecap="butt"
          hideDataPoints
          areaChart
          startFillColor={color}
          endFillColor={color}
          startOpacity={0.18}
          endOpacity={0.01}
          isAnimated
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
            areAmountsVisible ? formatAxisAmount(Number(label)) : MASKED_AMOUNT
          }
          pointerConfig={{
            pointerColor: color,
            pointerStripColor: THEME.outlineVariant,
            pointerStripWidth: 1,
            pointerStripUptoDataPoint: true,
            radius: 4,
            activatePointersOnLongPress: true,
            autoAdjustPointerLabelPosition: true,
            pointerLabelWidth: 144,
            pointerLabelHeight: 58,
            pointerLabelComponent: (items: CumulativeChartPoint[]) => (
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
                <Text
                  variant="labelMedium"
                  style={[styles.tooltipAmount, { color }]}
                >
                  {areAmountsVisible
                    ? (items[0]?.value ?? 0).toFixed(2)
                    : MASKED_AMOUNT}
                </Text>
              </View>
            ),
          }}
        />
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginHorizontal: 12,
    marginVertical: 8,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  legend: { alignItems: "center", flexDirection: "row", gap: 5 },
  legendDot: { borderRadius: 4, height: 8, width: 8 },
  loadingContainer: { alignItems: "center", flex: 1, justifyContent: "center" },
  title: { fontWeight: "700" },
  tooltip: {
    borderRadius: 10,
    elevation: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    width: 144,
  },
  tooltipAmount: { fontWeight: "700", marginTop: 2 },
});
