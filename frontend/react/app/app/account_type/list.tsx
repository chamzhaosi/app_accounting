import { router } from "expo-router";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppListCardView, {
  AppListCardItemType,
} from "../../components/AppListCardView";
import { AppToast } from "../../components/AppToast";
import AppView from "../../components/AppView";

export default function AccountTypeList() {
  const data: AppListCardItemType[] = [
    {
      id: "Banknote",
      label: "Cash",
      isEditable: false,
    },
    { id: "Landmark", label: "Bank", isEditable: false },
    { id: "WalletMinimal", label: "Wallet", isEditable: false },
    { id: "CreditCard", label: "Card", isEditable: false },
    {
      id: "CreditCard",
      label:
        "Card - in card drawer, my friend put de, dont take it Card - in card drawer, my friend put de, dont take it",
      isEditable: true,
    },
    { id: "CreditCard", label: "Other", isEditable: false },
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
      pathname: "/account_type/[id]",
      params: { id: item.id },
    });
  };

  return (
    <AppView className="relative">
      <AppView className="bg-LIGHT-BG_SECONDARY dark:bg-DARK-BG_SECONDARY ">
        <AppListCardView data={data} onPress={onPress} />
      </AppView>
      <AppFloatingButton
        icon="plus"
        onPress={() => router.push("/account_type/create")}
      />
    </AppView>
  );
}
