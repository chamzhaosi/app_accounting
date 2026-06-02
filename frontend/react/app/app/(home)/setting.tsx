import { useState } from "react";
import AppListView, { AppListItemType } from "../../components/AppListView";
import AppView from "../../components/AppView";
import {
  BookOpenCheck,
  HandCoins,
  RotateCcwKey,
  Vault,
  Wallet,
} from "lucide-react-native";
import { router } from "expo-router";

export default function Setting() {
  const data: AppListItemType[] = [
    {
      id: "1",
      label: "Account Type",
      icon: Wallet,
      onPress: () => router.push("/account_type/list"),
    },
    // { id: "2", label: "Account Management", icon: Vault },
    // { id: "3", label: "Category Management", icon: BookOpenCheck },
    // { id: "4", label: "Budget Management", icon: HandCoins },
    // { id: "5", label: "Reset Password", icon: RotateCcwKey },
  ];

  return (
    <AppView>
      <AppView className="bg-LIGHT-BG_SECONDARY dark:bg-DARK-BG_SECONDARY justify-center items-center">
        <AppListView data={data} />
      </AppView>
    </AppView>
  );
}
