import { ChevronRight, LucideIcon } from "lucide-react-native";
import { FlatList, FlatListProps, Pressable } from "react-native";
import { useThemeStore } from "../stores/useThemeStore";
import { cn } from "../utils/common";
import AppText from "./AppText";
import AppView from "./AppView";

export type AppListItemType = {
  id: string;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
};

type AppListViewType = Omit<FlatListProps<AppListItemType>, "renderItem"> & {
  data: AppListItemType[];
  className?: string;
  itemClassName?: string;
};

export default function AppListView({
  data,
  className,
  itemClassName,

  ...props
}: AppListViewType) {
  const { THEME } = useThemeStore();

  return (
    <FlatList
      className={cn(className)}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const Icon = item.icon;

        return (
          <Pressable
            onPress={item.onPress}
            className={cn(
              "w-full px-4 py-3 border-b flex-row justify-between",
              "border-slate-400/50 bg-LIGHT-LIST_ITEM_BG active:bg-LIGHT-LIST_ITEM_BG_PRESSED",
              "dark:bg-DARK-LIST_ITEM_BG dark:active:bg-DARK-LIST_ITEM_BG_PRESSED",
              itemClassName,
            )}
          >
            <Icon color={THEME.TEXT_PRIMARY} />
            <AppView className="w-full bg-inherit dark:bg-inherit ms-4">
              <AppText className="dark:text-DARK-TEXT_PRIMARY">
                {item.label}
              </AppText>
            </AppView>
            <ChevronRight color={THEME.TEXT_PRIMARY} />
          </Pressable>
        );
      }}
      {...props}
    />
  );
}
