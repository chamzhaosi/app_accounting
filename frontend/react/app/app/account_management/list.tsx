import { router } from "expo-router";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppListView from "../../components/AppListView";
import AppView from "../../components/AppView";
import {
  ACCOUNT_MANAGEMENT_BASE_URL,
  ACCOUNT_MANAGEMENT_CREATE_URL,
} from "../../constants/urls";
import useAccountManagementList from "../../hook/account_management/useAccountManagementList";

export default function AccountManagementList() {
  const logic = useAccountManagementList();
  if (logic.isLoading) {
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <AppView className="relative">
      <AppListView
        data={logic.accountItems}
        onPress={(item) =>
          router.push(`${ACCOUNT_MANAGEMENT_BASE_URL}/${item.id}`)
        }
        refreshing={logic.isRefetching && !logic.isFetchingNextPage}
        onRefresh={logic.onRefresh}
        onEndReached={logic.onLoadMore}
        onEndReachedThreshold={0.5}
      />
      <AppFloatingButton
        icon="plus"
        onPress={() => router.push(ACCOUNT_MANAGEMENT_CREATE_URL)}
      />
    </AppView>
  );
}
