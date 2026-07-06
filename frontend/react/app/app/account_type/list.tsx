import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import AppFloatingButton from "../../components/AppFloatingButton";
import { AppIconProps } from "../../components/AppIcon";
import AppListCardView, {
  AppListCardItemType,
} from "../../components/AppListCardView";
import { AppToast } from "../../components/AppToast";
import AppView from "../../components/AppView";
import {
  ACCOUNT_TYPE_CREATE_URL,
  ACCOUNT_TYPE_DETAIL_URL,
} from "../../constants/urls";
import { getAccTypeList } from "../../sql/service/accTypeService";
import { ActivityIndicator } from "react-native-paper";
import { View } from "react-native";

export default function AccountTypeList() {
  const pageSize = 40;
  const isFirstLoad = useRef<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(false);
  const [accTypeList, setAccTypeList] = useState<AppListCardItemType[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        fetchAccTypList(1, setIsInitialLoading);
      } else {
        fetchAccTypList(1);
      }
    }, []),
  );

  const fetchAccTypList = async (
    pageNum: number,
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    if (isLoading || isRefreshing) return;

    try {
      setLoading?.(true);

      const data = await getAccTypeList(pageNum, pageSize);

      setHasMoreData(data.length === pageSize);

      const fmtData: AppListCardItemType[] = data.map((d) => ({
        id: d.id,
        label: d.label,
        icon: d.icon as AppIconProps["name"],
        isEditable: !Boolean(d.is_system),
      }));

      setAccTypeList((prev) => (pageNum > 1 ? [...prev, ...fmtData] : fmtData));

      setPage(pageNum);
    } catch (e) {
      console.error("Error when getting account type list", e);
    } finally {
      setLoading?.(false);
    }
  };

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

  const onLoadMore = () => {
    if (isLoading || !hasMoreData) return;

    fetchAccTypList(page + 1, setIsLoading);
  };

  const onRefresh = async () => {
    await fetchAccTypList(1, setIsRefreshing);
  };

  // TODO: tanstack react query

  if (isInitialLoading)
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size={"large"} />
      </View>
    );

  return (
    <AppView className="relative">
      <AppListCardView
        data={accTypeList}
        onPress={onPress}
        extraCardHeight={20}
        refreshing={isRefreshing}
        isLoading={isLoading}
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
