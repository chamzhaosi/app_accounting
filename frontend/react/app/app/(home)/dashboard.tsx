import { router, useNavigation } from "expo-router";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppView from "../../components/AppView";
import {
  TRANSACTION_MANAGEMENT_CREATE_URL,
  TRANSACTION_SEARCH_URL,
} from "../../constants/urls";
import useDashboard from "../../hook/dashboard/useDashboard";
import TransactionManagementList from "../transaction_management/list";
import DashboardSummaryCarousel from "./_components/DashboardSummaryCarousel";
import InactiveBookBanner from "../../components/InactiveBookBanner";
import { useBookStore } from "../../stores/useBookStore";
import { useLayoutEffect } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton } from "react-native-paper";
import AppIconButton from "../../components/AppIconButton";
import { useThemeStore } from "../../stores/useThemeStore";
import { useTranslation } from "../../i18n/helper";

export default function Dashboard() {
  const { dateRange, endDate, onDateRangeChange, startDate } = useDashboard();
  const activeBook = useBookStore((state) => state.activeBook);
  const isWritable = Boolean(activeBook?.is_active);
  const navigation = useNavigation();
  const { THEME } = useThemeStore();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        isWritable && (
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
        ),
    });
  }, [THEME.primary, isWritable, navigation, t]);

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow">
      <InactiveBookBanner />
      <DashboardSummaryCarousel
        dateRange={dateRange}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={onDateRangeChange}
      />
      <TransactionManagementList startDate={startDate} endDate={endDate} />

      {isWritable ? (
        <AppFloatingButton
          icon="plus"
          onPress={() => router.push(TRANSACTION_MANAGEMENT_CREATE_URL)}
        />
      ) : null}
    </AppView>
  );
}

const styles = StyleSheet.create({
  searchButton: {
    alignItems: "center",
    height: 25,
    justifyContent: "center",
    width: 25,
    marginRight: 8,
  },
});
