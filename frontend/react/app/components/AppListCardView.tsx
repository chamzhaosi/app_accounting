import { Info, PencilOff } from "lucide-react-native";
import {
  Animated,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import {
  KeyboardAwareFlatList,
  KeyboardAwareFlatListProps,
} from "react-native-keyboard-aware-scroll-view";
import {
  ActivityIndicator,
  Surface,
  Tooltip,
  TouchableRipple,
} from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";
import { cn } from "../utils/common";
import AppEmpty from "./AppEmpty";
import AppIcon, { AppIconProps } from "./AppIcon";
import AppSpacer from "./AppSpacer";
import AppText from "./AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type AppListCardItemType = {
  id: number | string;
  icon: AppIconProps["name"];
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
  selectedItemId?: AppListCardItemType["id"];
  extraCardHeight?: number;
  onPress: (item: AppListCardItemType) => void;
  numberItemInRow?: number;
  isShowNoMoreData?: boolean;
  parentWidth?: number;
  isLoading?: boolean;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | Animated.Value;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function AppListCardView({
  data,
  className,
  itemClassName,
  isShowIconOnly,
  selectedItem,
  selectedItemId,
  onPress,
  extraCardHeight = 0,
  extraScrollHeight,
  onRefresh,
  isShowNoMoreData,
  numberItemInRow,
  onScroll,
  parentWidth,
  containerStyle,
  contentContainerStyle,
  isLoading,
  elevation = 3,
  ...props
}: AppListViewProps) {
  const { THEME } = useThemeStore();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const gapSize = 16;
  const itemNumInRow = numberItemInRow ?? (isShowIconOnly ? 6 : 4);
  const itemSize = Math.floor(
    ((parentWidth ?? width) - gapSize * (itemNumInRow + 1)) / itemNumInRow,
  );

  const genListRenderItem = ({ item }: { item: AppListCardItemType }) => {
    const isItemSelected =
      selectedItemId !== undefined
        ? item.id === selectedItemId
        : item.icon === selectedItem;

    return (
      <Surface
        style={[
          defaultStyle.container,
          {
            height: itemSize + extraCardHeight,
            width: itemSize,
            backgroundColor: isItemSelected
              ? THEME.tertiary
              : THEME.surfaceContainer,
          },
          containerStyle,
        ]}
        elevation={elevation}
      >
        <TouchableRipple
          onPress={() => onPress(item)}
          style={defaultStyle.rippleContainer}
        >
          <>
            {item.isEditable === false && (
              <View className="absolute bottom-1 right-1">
                <PencilOff size={16} color={THEME.error} />
              </View>
            )}
            {item.description && (
              <View className="absolute top-1 right-1">
                <Tooltip title={item.description}>
                  <Info size={20} color={THEME.tertiary} />
                </Tooltip>
              </View>
            )}
            <AppIcon
              name={item.icon}
              size={30}
              color={isItemSelected ? THEME.onTertiary : undefined}
            />

            {!isShowIconOnly && (
              <>
                <AppSpacer height={4} />
                <AppText
                  variant="bodySmall"
                  className="text-LIGHT-primary dark:text-DARK-primary text-justify"
                  numberOfLines={2}
                  style={[
                    isItemSelected && { color: THEME.onTertiary },
                    { fontSize: 14 },
                  ]}
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
      style={{ marginBottom: insets.bottom }}
      refreshing={false}
      onRefresh={onRefresh}
      data={data}
      numColumns={itemNumInRow}
      columnWrapperStyle={defaultStyle.columnWrapperStyle}
      contentContainerStyle={[
        defaultStyle.contentContainerStyle,
        contentContainerStyle,
      ]}
      renderItem={genListRenderItem}
      ListEmptyComponent={isLoading ? <></> : <AppEmpty />}
      ListFooterComponent={
        isLoading ? (
          <ActivityIndicator className="my-4" size={30} />
        ) : isShowNoMoreData ? (
          genNoMoreData
        ) : undefined
      }
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
    padding: 12,
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
