import { router, useRouter } from "expo-router";
import React from "react";
import { useWindowDimensions } from "react-native";
import { Route, TabBar, TabBarProps, TabView } from "react-native-tab-view";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppListCardView, {
  AppListCardItemType,
} from "../../components/AppListCardView";
import { AppToast } from "../../components/AppToast";
import AppView from "../../components/AppView";
import { useThemeStore } from "../../stores/useThemeStore";
import {
  CATEGORY_MANAGEMENT_CREATE_URL,
  CATEGORY_MANAGEMENT_DETAIL_URL,
} from "../../constants/urls";

type TabRoute = Route & {
  key: "inc" | "exp";
  title: string;
};

export default function CategoryManagementList() {
  const router = useRouter();
  const { THEME } = useThemeStore();
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);

  const routes: TabRoute[] = [
    { key: "inc", title: "Income" },
    { key: "exp", title: "Expense" },
  ];

  const incData: AppListCardItemType[] = [
    {
      id: 1,
      icon: "Users",
      label: "Salary",
    },
    {
      id: 2,
      icon: "HeartHandshake",
      label: "Bonus",
      isEditable: false,
    },
    {
      id: 3,
      icon: "Coins",
      label: "Cash back",
    },
    { id: 4, icon: "HandCoins", label: "Allowance" },
    {
      id: 5,
      icon: "Banknote",
      label: "Refund",
      isEditable: false,
    },
    {
      id: 6,
      icon: "Handshake",
      label: "Part time",
    },
  ];

  const expData: AppListCardItemType[] = [
    {
      id: 1,
      icon: "Hamburger",
      label: "Daily Meal - In Muar",
    },
    {
      id: 2,
      icon: "ShoppingBasket",
      label: "Grocery",
      description: "Essential item for everyday using",
      isEditable: false,
    },
    {
      id: 3,
      icon: "GraduationCap",
      label: "Education",
      description: "Study material, PTPTN and exam fees",
    },
    { id: 4, icon: "Gamepad2", label: "Entertainment" },
    {
      id: 5,
      icon: "FileText",
      label: "Insurance",
      isEditable: false,
    },
    {
      id: 6,
      icon: "Pill",
      label: "Medical",
      description: "Medicine and consultation fee",
    },
  ];

  const renderTabBar = (props: TabBarProps<any>) => (
    <TabBar
      {...props}
      activeColor={THEME.primary}
      inactiveColor={THEME.outline}
      indicatorStyle={{ backgroundColor: THEME.primary }}
      style={{ backgroundColor: THEME.secondaryContainer }}
    />
  );

  const renderScene = ({ route }: { route: TabRoute }) => {
    const listItem = route.key === "inc" ? incData : expData;

    return (
      <AppView className="relative">
        <TxnTypeTabView cardItems={listItem} />
        <AppFloatingButton
          icon="plus"
          onPress={() =>
            router.push({
              pathname: CATEGORY_MANAGEMENT_CREATE_URL,
              params: {
                type: route.key,
              },
            })
          }
        />
      </AppView>
    );
  };

  return (
    <TabView
      renderTabBar={renderTabBar}
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  );
}

function TxnTypeTabView({ cardItems }: { cardItems: AppListCardItemType[] }) {
  const onPress = (item: AppListCardItemType) => {
    if (item.isEditable === false) {
      AppToast.error({
        title: "Not Editable",
        message: "System-created types cannot be edited.",
      });
      return;
    }

    router.push({
      pathname: CATEGORY_MANAGEMENT_DETAIL_URL,
      params: { id: item.id },
    });
  };

  return (
    <AppListCardView
      data={cardItems}
      onPress={onPress}
      extraCardHeight={-12}
      numberItemInRow={3}
    />
  );
}
