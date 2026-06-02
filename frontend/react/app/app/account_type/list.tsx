import {
  Banknote,
  CreditCard,
  Landmark,
  WalletMinimal,
} from "lucide-react-native";
import AppListCardView, {
  AppListCardItemType,
} from "../../components/AppListCardView";
import { AppToast } from "../../components/AppToast";
import AppView from "../../components/AppView";
import AppButton from "../../components/AppButton";
import AppFloatingButton from "../../components/AppFloatingButton";
import { router } from "expo-router";

export default function AccountTypeList() {
  const data: AppListCardItemType[] = [
    {
      id: "1",
      label: "Cash",
      icon: Banknote,
      isEditable: false,
    },
    { id: "2", label: "Bank", icon: Landmark, isEditable: false },
    { id: "3", label: "Wallet", icon: WalletMinimal, isEditable: false },
    { id: "4", label: "Card", icon: CreditCard, isEditable: false },
    {
      id: "5",
      label:
        "Card - in card drawer, my friend put de, dont take it Card - in card drawer, my friend put de, dont take it",
      icon: CreditCard,
      isEditable: true,
    },
    { id: "6", label: "Other", icon: CreditCard, isEditable: false },
  ];

  const onPress = (item: AppListCardItemType) => {
    if (!item.isEditable) {
      AppToast.error({
        title: "Not Editable",
        message: "System-created types cannot be edited.",
      });
      return;
    }
  };

  return (
    <AppView className="relative">
      <AppView className="bg-LIGHT-BG_SECONDARY dark:bg-DARK-BG_SECONDARY ">
        <AppListCardView data={data} onPress={onPress} />
      </AppView>
      <AppFloatingButton onPress={() => router.push("/account_type/create")} />
    </AppView>
  );
}
