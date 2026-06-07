import { ChevronRight, LucideIcon } from "lucide-react-native";
import { FlatList, FlatListProps, Pressable } from "react-native";
import { useThemeStore } from "../stores/useThemeStore";
import { cn } from "../utils/common";
import AppText from "./AppText";
import AppView from "./AppView";
import { List } from "react-native-paper";
import { FONTS } from "../constants/fonts";
import { SafeAreaView } from "react-native-safe-area-context";

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
      className={cn("w-full", className)}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const Icon = item.icon;
        return (
          <List.Item
            centered
            onPress={item.onPress}
            style={{
              backgroundColor: THEME.surfaceContainer,
              borderBottomWidth: 0.6,
              borderBlockColor: THEME.outline,
            }}
            rippleColor={THEME.surfaceContainerHighest}
            containerStyle={{
              marginInline: 12,
            }}
            title={item.label}
            titleStyle={{ fontFamily: FONTS.ROBOTO }}
            left={() => <Icon style={{}} />}
            right={() => <ChevronRight color={THEME.onSurface} />}
          />
        );
      }}
      {...props}
    />
  );
}
