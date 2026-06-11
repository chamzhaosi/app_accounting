import { router } from "expo-router";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppListCardView, {
  AppListCardItemType,
} from "../../components/AppListCardView";
import AppView from "../../components/AppView";
import AppListView, { AppListItemType } from "../../components/AppListView";

export default function AccountManagementList() {
  const data: AppListItemType[] = [
    {
      id: 1,
      icon: "Banknote",
      label: "Cash - In Car",
      descriptions: "This cash is using for petrol only",
    },
    {
      id: 2,
      icon: "Banknote",
      label: "Cash - In Wallet",
    },
    {
      id: 3,
      icon: "Landmark",
      label: "PBB Bank",
    },
    {
      id: 4,
      icon: "Landmark",
      label: "Maybank",
    },
    {
      id: 5,
      icon: "CreditCard",
      label: "Maybank - Master Card",
      onPress: () => router.push("/account_management/1"),
    },
  ];

  const onPress = (item: AppListCardItemType) => {
    // router.push({
    //   pathname: "/account_management/[id]",
    //   params: { id: item.id },
    // });
  };

  return (
    <AppView className="relative">
      <AppView>
        <AppListView
          data={data}
          onPress={(item) => router.push(`/account_management/${item.id}`)}
        />
      </AppView>
      <AppFloatingButton
        icon="plus"
        onPress={() => router.push("/account_management/create")}
      />
    </AppView>
  );
}
