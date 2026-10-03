import CumulativeLineChartCard from "../../../../components/CumulativeLineChartCard";
import { CATEGORY_DETAIL_CARD_HEIGHT } from "../../../../constants/size";
import useCategoryCumulativeChart from "../../../../hook/category_management/useCategoryCumulativeChart";
import { useThemeStore } from "../../../../stores/useThemeStore";

type CategoryCumulativeChartProps = {
  categoryId: string;
  typeId: number;
  startDate: string;
  endDate: string;
  currencyCode: string;
  beneficiaryIds?: string[];
};

export default function CategoryCumulativeChart({
  categoryId,
  typeId,
  startDate,
  endDate,
  currencyCode,
  beneficiaryIds,
}: CategoryCumulativeChartProps) {
  const { THEME } = useThemeStore();
  const logic = useCategoryCumulativeChart({
    categoryId,
    endDate,
    startDate,
    currencyCode,
    beneficiaryIds,
  });

  const isIncome = typeId === 1;
  return (
    <CumulativeLineChartCard
      title={`Cumulative ${isIncome ? "income" : "expense"}`}
      seriesLabel={isIncome ? "Income" : "Expense"}
      data={logic.data}
      color={isIncome ? THEME.primary : THEME.error}
      cardHeight={CATEGORY_DETAIL_CARD_HEIGHT}
      isLoading={logic.isLoading}
    />
  );
}
