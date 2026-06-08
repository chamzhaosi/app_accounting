import { ACCOUNT_TYPE_ICONS } from "../../constants/account_type";
import { AppIconProps } from "../AccIcon";
import AppListCardView from "../AppListCardView";
import AppView from "../AppView";

type AccTypeIconsListType = {
  setSelectedItem: React.Dispatch<React.SetStateAction<AppIconProps["name"]>>;
  selectedItem: AppIconProps["name"];
  disabled?: boolean;
};

export const iconData = ACCOUNT_TYPE_ICONS.map((i) => ({
  id: i,
  label: "",
  isEditable: true,
}));

export default function AccTypeIconsList({
  setSelectedItem,
  selectedItem,
  disabled,
}: AccTypeIconsListType) {
  return (
    <AppView className="bg-LIGHT-surfaceContainerHigh dark:bg-DARK-surfaceContainerHigh">
      <AppListCardView
        data={iconData}
        onPress={(item) => (disabled ? {} : setSelectedItem(item.id))}
        selectedItem={selectedItem}
        isShowIconOnly
      />
    </AppView>
  );
}
