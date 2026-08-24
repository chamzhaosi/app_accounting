import { Href, router } from "expo-router";
import AppListView, { AppListItemType } from "../../components/AppListView";
import AppView from "../../components/AppView";
import {
  ACCOUNT_MANAGEMENT_LIST_URL,
  ACCOUNT_SETTINGS_URL,
  ACCOUNT_TYPE_LIST_URL,
  CATEGORY_MANAGEMENT_LIST_URL,
  BUDGET_MANAGEMENT_URL,
  LOCAL_AUTHENTICATE_URL,
} from "../../constants/urls";
import { useTranslation } from "../../i18n";

export default function Setting() {
  const { t } = useTranslation();
  const data: AppListItemType[] = [
    {
      id: "account-settings",
      label: t("Account Settings"),
      descriptions: t("Nickname, email, and language"),
      icon: "UserRound",
      onPress: () => router.push(ACCOUNT_SETTINGS_URL as Href),
    },
    {
      id: 1,
      label: t("Account Type"),
      icon: "Wallet",
      onPress: () => router.push(ACCOUNT_TYPE_LIST_URL),
    },
    {
      id: 2,
      label: t("Account Management"),
      icon: "Vault",
      onPress: () => router.push(ACCOUNT_MANAGEMENT_LIST_URL),
    },
    {
      id: 3,
      label: t("Category Management"),
      icon: "BookOpenCheck",
      onPress: () => router.push(CATEGORY_MANAGEMENT_LIST_URL),
    },
    {
      id: 4,
      label: t("Budget Management"),
      icon: "HandCoins",
      onPress: () => router.push(BUDGET_MANAGEMENT_URL as Href),
    },
    // {
    //   id: 5,
    //   label: "Reset Password",
    //   icon: "RotateCcwKey",
    //   onPress: () => router.push("/reset_password"),
    // },
    {
      id: 5,
      label: t("Security"),
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
