import { PencilOff } from "lucide-react-native";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import {
  KeyboardAwareFlatList,
  KeyboardAwareFlatListProps,
} from "react-native-keyboard-aware-scroll-view";
import { Surface, TouchableRipple } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";
import { cn } from "../utils/common";
import AppIcon, { AppIconProps } from "./AccIcon";
import AppSpacer from "./AppSpacer";
import AppText from "./AppText";
import AppEmpty from "./AppEmpty";

export type AppListCardItemType = {
  id: AppIconProps["name"];
  label: string;
  description?: string;
  isEditable?: boolean;
};

type AppListViewProps = Omit<
  KeyboardAwareFlatListProps<AppListCardItemType>,
  "renderItem"
> & {
  data: AppListCardItemType[];
  className?: string;
  itemClassName?: string;
  isShowIconOnly?: boolean;
  selectedItem?: AppIconProps["name"];
  onPress: (item: AppListCardItemType) => void;
};

export default function AppListCardView({
  data,
  className,
  itemClassName,
  isShowIconOnly,
  selectedItem,
  onPress,
  extraScrollHeight,
  onRefresh,
  ...props
}: AppListViewProps) {
  const { THEME } = useThemeStore();
  const { width } = useWindowDimensions();

  const itemNumInRow = isShowIconOnly ? 6 : 4;
  const itemSize = Math.floor((width - 16 * (itemNumInRow + 1)) / itemNumInRow);

  const genListRenderItem = ({ item }: { item: AppListCardItemType }) => {
    const isItemSelected = item.id === selectedItem;

    return (
      <Surface
        style={[
          defaultStyle.container,
          {
            height: itemSize,
            width: itemSize,
            backgroundColor: isItemSelected
              ? THEME.tertiary
              : THEME.surfaceContainer,
          },
        ]}
        elevation={3}
      >
        <TouchableRipple
          onPress={() => onPress(item)}
          rippleColor={THEME.surfaceContainerHighest}
          style={defaultStyle.rippleContainer}
        >
          <>
            {item.isEditable === false && (
              <View className="absolute top-1 right-1">
                <PencilOff size={12} color={THEME.error} />
              </View>
            )}
            <AppIcon
              name={item.id}
              color={isItemSelected ? THEME.onTertiary : THEME.primary}
            />

            {!isShowIconOnly && (
              <>
                <AppSpacer height={4} />
                <AppText
                  variant="bodySmall"
                  className="text-LIGHT-primary dark:text-DARK-primary text-justify"
                  numberOfLines={2}
                >
                  {item.label}
                </AppText>
              </>
            )}
          </>
        </TouchableRipple>
      </Surface>
    );
  };

  const genNoMoreData = (
    <AppText className="py-4 self-center" style={{ color: THEME.outline }}>
      ----- No more data -----
    </AppText>
  );

  return (
    <KeyboardAwareFlatList
      className={cn(className)}
      refreshing={false}
      onRefresh={onRefresh}
      data={data}
      numColumns={itemNumInRow}
      columnWrapperStyle={defaultStyle.columnWrapperStyle}
      contentContainerStyle={defaultStyle.contentContainerStyle}
      renderItem={genListRenderItem}
      ListEmptyComponent={<AppEmpty />}
      ListFooterComponent={genNoMoreData}
      keyExtractor={(item) => item.id}
      enableOnAndroid
      extraScrollHeight={extraScrollHeight ?? 40}
      keyboardShouldPersistTaps="handled"
      {...props}
    />
  );
}

const defaultStyle = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden",
  },
  rippleContainer: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: "8px",
  },
  columnWrapperStyle: {
    justifyContent: "flex-start",
    marginBottom: 16,
    gap: 16,
  },
  contentContainerStyle: {
    padding: 16,
  },
});
