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
import {
  ACCOUNT_MANAGEMENT_LIST_URL,
  ACCOUNT_TYPE_LIST_URL,
  CATEGORY_MANAGEMENT_LIST_URL,
  LOCAL_AUTHENTICATE_URL,
} from "../../constants/urls";

export default function Setting() {
  const data: AppListItemType[] = [
    {
      id: 1,
      label: "Account Type",
      icon: "Wallet",
      onPress: () => router.push(ACCOUNT_TYPE_LIST_URL),
    },
    {
      id: 2,
      label: "Account Management",
      icon: "Vault",
      onPress: () => router.push(ACCOUNT_MANAGEMENT_LIST_URL),
    },
    {
      id: 3,
      label: "Category Management",
      icon: "BookOpenCheck",
      onPress: () => router.push(CATEGORY_MANAGEMENT_LIST_URL),
    },
    // { id: "4", label: "Budget Management", icon: HandCoins },
    // {
    //   id: 5,
    //   label: "Reset Password",
    //   icon: "RotateCcwKey",
    //   onPress: () => router.push("/reset_password"),
    // },
    {
      id: 5,
      label: "Security",
      icon: "Lock",
      onPress: () => router.push(LOCAL_AUTHENTICATE_URL),
    },
  ];

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow justify-center items-center">
      <AppListView data={data} />
    </AppView>
  );
}
