import { ChevronRight } from "lucide-react-native";
import { FlatList, FlatListProps, StyleSheet } from "react-native";
import { List } from "react-native-paper";
import { FONTS } from "../constants/fonts";
import { useThemeStore } from "../stores/useThemeStore";
import { cn } from "../utils/common";
import AppIcon, { AppIconProps } from "./AppIcon";
import {
  LIST_ITEM_TITLE_FONTSIZE,
  LIST_ITEM_DESCRIPTION_FONTSIZE,
} from "../constants/size";

export type AppListItemType = {
  id: number;
  icon: AppIconProps["name"];
  label: string;
  descriptions?: string;
  onPress?: () => void;
};

type AppListViewType = Omit<FlatListProps<AppListItemType>, "renderItem"> & {
  data: AppListItemType[];
  className?: string;
  itemClassName?: string;
  onPress?: (item: AppListItemType) => void;
};

export default function AppListView({
  data,
  className,
  itemClassName,
  onPress,
  ...props
}: AppListViewType) {
  const { THEME } = useThemeStore();

  const genFlatListRenderItem = ({ item }: { item: AppListItemType }) => {
    return (
      <List.Item
        centered
        onPress={() => (onPress ? onPress(item) : item.onPress?.())}
        title={item.label}
        titleStyle={[defaultStyle.listItemLabel]}
        description={item.descriptions}
        descriptionStyle={[defaultStyle.listItemDescription]}
        style={[
          defaultStyle.listItemContainer,
          {
            backgroundColor: THEME.surfaceContainer,
            borderBlockColor: THEME.outline,
          },
        ]}
        rippleColor={THEME.surfaceContainerHighest}
        containerStyle={defaultStyle.containerStyle}
        left={() => <AppIcon name={item.icon} />}
        right={() => <ChevronRight color={THEME.onSurface} />}
      />
    );
  };

  return (
    <FlatList
      className={cn("w-full", className)}
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={genFlatListRenderItem}
      {...props}
    />
  );
}

const defaultStyle = StyleSheet.create({
  listItemContainer: {
    paddingInline: 4,
    borderBottomWidth: 0.6,
  },
  listItemLabel: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_TITLE_FONTSIZE,
  },
  listItemDescription: {
    fontSize: LIST_ITEM_DESCRIPTION_FONTSIZE,
  },
  containerStyle: {
    marginInline: 12,
  },
});
