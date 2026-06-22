import { router } from "expo-router";
import AppFloatingButton from "../../components/AppFloatingButton";
import { AppListCardItemType } from "../../components/AppListCardView";
import AppListView, { AppListItemType } from "../../components/AppListView";
import AppView from "../../components/AppView";
import {
  ACCOUNT_MANAGEMENT_BASE_URL,
  ACCOUNT_MANAGEMENT_CREATE_URL,
} from "../../constants/urls";

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
      onPress: () => router.push(`${ACCOUNT_MANAGEMENT_BASE_URL}/1`),
    },
  ];

  const onPress = (item: AppListCardItemType) => {
    // router.push({
    //   pathname: CATEGORY_MANAGEMENT_DETAIL_URL
    //   params: { id: item.id },
    // });
  };

  return (
    <AppView className="relative">
      <AppListView
        data={data}
        onPress={(item) =>
          router.push(`${ACCOUNT_MANAGEMENT_BASE_URL}/${item.id}`)
        }
      />
      <AppFloatingButton
        icon="plus"
        onPress={() => router.push(ACCOUNT_MANAGEMENT_CREATE_URL)}
      />
    </AppView>
  );
}
