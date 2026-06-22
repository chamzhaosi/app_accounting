import { router } from "expo-router";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppListCardView, {
  AppListCardItemType,
} from "../../components/AppListCardView";
import { AppToast } from "../../components/AppToast";
import AppView from "../../components/AppView";
import {
  ACCOUNT_TYPE_CREATE_URL,
  ACCOUNT_TYPE_DETAIL_URL,
} from "../../constants/urls";

export default function AccountTypeList() {
  const data: AppListCardItemType[] = [
    {
      id: 1,
      icon: "Banknote",
      label: "Cash",
      isEditable: false,
    },
    { id: 2, icon: "Landmark", label: "Bank", isEditable: false },
    {
      id: 3,
      icon: "WalletMinimal",
      label: "Wallet",
      isEditable: false,
    },
    { id: 4, icon: "CreditCard", label: "Card", isEditable: false },
    {
      id: 5,
      icon: "Landmark",
      label:
        "Card - in card drawer, my friend put de, dont take it Card - in card drawer, my friend put de, dont take it",
      isEditable: true,
    },
    { id: 6, icon: "CreditCard", label: "Other", isEditable: false },
  ];

  const onPress = (item: AppListCardItemType) => {
    if (!item.isEditable) {
      AppToast.error({
        title: "Not Editable",
        message: "System-created types cannot be edited.",
      });
      return;
    }

    router.push({
      pathname: ACCOUNT_TYPE_DETAIL_URL,
      params: { id: item.id },
    });
  };

  return (
    <AppView className="relative">
      <AppListCardView data={data} onPress={onPress} extraCardHeight={20} />
      <AppFloatingButton
        icon="plus"
        onPress={() => router.push(ACCOUNT_TYPE_CREATE_URL)}
      />
    </AppView>
  );
}
