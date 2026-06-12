import { ACCOUNT_TYPE_ICONS } from "../../constants/account_type";
import { cn } from "../../utils/common";
import { AppIconProps } from "../AccIcon";
import AppListCardView, { AppListCardItemType } from "../AppListCardView";
import AppView from "../AppView";

type AccTypeIconsListType = {
  className?: string;
  setSelectedItem: React.Dispatch<React.SetStateAction<AppIconProps["name"]>>;
  selectedItem: AppIconProps["name"];
  disabled?: boolean;
  onScroll?: () => void;
};

export const iconData: AppListCardItemType[] = ACCOUNT_TYPE_ICONS.map(
  (i, index) => ({
    id: index,
    label: "",
    icon: i,
  }),
);

export default function CtgryIconsList({
  className,
  setSelectedItem,
  selectedItem,
  disabled,
  onScroll,
}: AccTypeIconsListType) {
  return (
    <AppView
      className={cn(
        "bg-LIGHT-surfaceContainerHigh dark:bg-DARK-surfaceContainerHigh",
        className,
      )}
    >
      <AppListCardView
        data={iconData}
        onPress={(item) => (disabled ? {} : setSelectedItem(item.icon))}
        selectedItem={selectedItem}
        isShowIconOnly
        onScroll={onScroll}
      />
    </AppView>
  );
}
