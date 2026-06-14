import { ICONS } from "../../../constants/icons";
import { cn } from "../../../utils/common";
import { AppIconProps } from "../../../components/AppIcon";
import AppListCardView, {
  AppListCardItemType,
} from "../../../components/AppListCardView";
import AppView from "../../../components/AppView";

type AccTypeIconsListType = {
  className?: string;
  setSelectedItem: React.Dispatch<React.SetStateAction<AppIconProps["name"]>>;
  selectedItem: AppIconProps["name"];
  disabled?: boolean;
};

export const iconData: AppListCardItemType[] = ICONS.ACCOUNT_TYPE.map(
  (i, index) => ({
    id: index,
    label: "",
    icon: i,
  }),
);

export default function AccTypeIconsList({
  className,
  setSelectedItem,
  selectedItem,
  disabled,
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
      />
    </AppView>
  );
}
