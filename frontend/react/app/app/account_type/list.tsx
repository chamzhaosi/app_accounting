import { router } from "expo-router";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppListCardView from "../../components/AppListCardView";
import AppView from "../../components/AppView";
import { ACCOUNT_TYPE_CREATE_URL } from "../../constants/urls";
import useAccountTypeList from "../../hook/account_type/useAccountTypeList";

export default function AccountTypeList() {
  const {
    accountTypeItems,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    onLoadMore,
    onPress,
    onRefresh,
  } = useAccountTypeList();

  if (isLoading) {
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppView className="relative">
      <AppListCardView
        data={accountTypeItems}
        onPress={onPress}
        extraCardHeight={20}
        refreshing={isRefetching && !isFetchingNextPage}
        isLoading={isFetchingNextPage}
        onRefresh={onRefresh}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
      />
      <AppFloatingButton
        icon="plus"
        onPress={() => router.push(ACCOUNT_TYPE_CREATE_URL)}
      />
    </AppView>
  );
}
