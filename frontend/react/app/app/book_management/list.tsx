import { router } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { View } from "react-native";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppListView from "../../components/AppListView";
import AppView from "../../components/AppView";
import { BOOK_MANAGEMENT_CREATE_URL } from "../../constants/urls";
import useBookManagementList from "../../hook/book_management/useBookManagementList";

export default function BookManagementList() {
  const logic = useBookManagementList();
  if (logic.isLoading)
    return (
      <View className="h-full items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  return (
    <AppView>
      <AppListView
        data={logic.items}
        refreshing={logic.isRefetching}
        onRefresh={logic.refetch}
      />
      <AppFloatingButton
        icon="plus"
        onPress={() => router.push(BOOK_MANAGEMENT_CREATE_URL as never)}
      />
    </AppView>
  );
}
