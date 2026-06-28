import { router } from "expo-router";
import { useEffect, useState } from "react";
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

export default function AccountTypeList() {
  const [accTypeList, setAccTypeList] = useState<AppListCardItemType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    getAccTypeList()
      .then((data) => {
        if (!data || data.length === 0) return;

        setAccTypeList(
          data.map((d) => {
            return {
              id: d.id,
              label: d.label,
              icon: d.icon as AppIconProps["name"],
              isEditable: !Boolean(d.is_system),
            };
          }),
        );
      })
      .catch((e) => {
        console.error("Error when getting account type list", e);
      })
      .finally(() => setIsLoading(false));
  }, []);

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

  // TODO: pull refresh, tanstack react query, loading sekeleton

  return (
    <AppView className="relative">
      <AppListCardView
        data={accTypeList}
        onPress={onPress}
        extraCardHeight={20}
        isLoading={isLoading}
      />
      <AppFloatingButton
        icon="plus"
        onPress={() => router.push(ACCOUNT_TYPE_CREATE_URL)}
      />
    </AppView>
  );
}
