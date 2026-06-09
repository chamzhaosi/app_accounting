import { ChevronRight, LucideIcon } from "lucide-react-native";
import { FlatList, FlatListProps, StyleSheet } from "react-native";
import { List } from "react-native-paper";
import { FONTS } from "../constants/fonts";
import { useThemeStore } from "../stores/useThemeStore";
import { cn } from "../utils/common";

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

  const genFlatListRenderItem = ({ item }: { item: AppListItemType }) => {
    const Icon = item.icon;
    return (
      <List.Item
        centered
        onPress={item.onPress}
        title={item.label}
        titleStyle={{ fontFamily: FONTS.ROBOTO }}
        style={[
          defaultStyle.listItemContainer,
          {
            backgroundColor: THEME.surfaceContainer,
            borderBlockColor: THEME.outline,
          },
        ]}
        rippleColor={THEME.surfaceContainerHighest}
        containerStyle={defaultStyle.containerStyle}
        left={() => <Icon style={{}} />}
        right={() => <ChevronRight color={THEME.onSurface} />}
      />
    );
  };

  return (
    <FlatList
      className={cn("w-full", className)}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={genFlatListRenderItem}
      {...props}
    />
  );
}

const defaultStyle = StyleSheet.create({
  listItemContainer: {
    borderBottomWidth: 0.6,
  },
  containerStyle: {
    marginInline: 12,
  },
});
