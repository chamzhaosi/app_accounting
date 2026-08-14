import { ChevronRight } from "lucide-react-native";
import { FlatList, FlatListProps, StyleSheet, View } from "react-native";
import { List } from "react-native-paper";
import { FONTS } from "../constants/fonts";
import { useThemeStore } from "../stores/useThemeStore";
import { cn } from "../utils/common";
import AppIcon, { AppIconProps } from "./AppIcon";
import {
  LIST_ITEM_TITLE_FONTSIZE,
  LIST_ITEM_DESCRIPTION_FONTSIZE,
} from "../constants/size";
import AppEmpty from "./AppEmpty";
import { JSX, ReactNode } from "react";

export type AppListItemType = {
  id: number | string;
  icon: AppIconProps["name"];
  label: ReactNode | string;
  descriptions?: string;
  onPress?: () => void;
};

type AppListViewType<T> = Omit<FlatListProps<T>, "renderItem"> & {
  data: T[];
  className?: string;
  itemClassName?: string;
  onPress?: (item: T) => void;
  isHideLeftIcon?: boolean;
  selectedItem?: T;
  genCstmFlatListRenderItem?: (props: { item: T }) => JSX.Element;
};

export default function AppListView<T extends AppListItemType>({
  data,
  className,
  itemClassName,
  onPress,
  contentContainerStyle,
  isHideLeftIcon,
  selectedItem,
  genCstmFlatListRenderItem,
  ...props
}: AppListViewType<T>) {
  const { THEME } = useThemeStore();

  const genFlatListRenderItem = ({ item }: { item: T }) => {
    const isItemSelected = selectedItem ? selectedItem.id === item.id : false;
    return (
      <List.Item
        centered
        onPress={() => (onPress ? onPress(item) : item.onPress?.())}
        title={item.label}
        titleStyle={[
          defaultStyle.listItemLabel,
          isItemSelected && { color: THEME.onTertiary },
        ]}
        description={item.descriptions}
        descriptionStyle={[
          defaultStyle.listItemDescription,
          isItemSelected && { color: THEME.onTertiary },
        ]}
        style={[
          defaultStyle.listItemContainer,
          {
            backgroundColor: THEME.surfaceContainer,
            borderBlockColor: THEME.outline,
          },
          isItemSelected && { backgroundColor: THEME.tertiary },
        ]}
        rippleColor={THEME.surfaceContainerHighest}
        containerStyle={defaultStyle.containerStyle}
        left={() => (
          <AppIcon
            name={item.icon}
            color={isItemSelected ? THEME.onTertiary : undefined}
          />
        )}
        right={() =>
          isHideLeftIcon ? undefined : <ChevronRight color={THEME.onSurface} />
        }
      />
    );
  };

  return (
    <FlatList
      className={cn("w-full", className)}
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={genCstmFlatListRenderItem ?? genFlatListRenderItem}
      contentContainerStyle={[
        data.length === 0 && defaultStyle.emptyContentContainer,
        contentContainerStyle,
      ]}
      ListEmptyComponent={
        <View style={defaultStyle.emptyContainer}>
          <AppEmpty />
        </View>
      }
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
    alignItems: "center",
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
