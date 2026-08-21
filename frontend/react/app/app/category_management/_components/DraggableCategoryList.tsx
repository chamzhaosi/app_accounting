import { Info, PencilOff } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { DraggableGrid } from "react-native-draggable-grid";
import { ActivityIndicator, Surface, Tooltip } from "react-native-paper";
import AppEmpty from "../../../components/AppEmpty";
import AppIcon from "../../../components/AppIcon";
import type { AppListCardItemType } from "../../../components/AppListCardView";
import AppSpacer from "../../../components/AppSpacer";
import AppText from "../../../components/AppText";
import { useThemeStore } from "../../../stores/useThemeStore";

const COLUMN_COUNT = 3;
const GRID_GAP = 16;
const GRID_HORIZONTAL_MARGIN = GRID_GAP / 2;

type GridCategoryItem = AppListCardItemType & {
  key: string;
  disabledDrag?: boolean;
};

type Props = {
  data: AppListCardItemType[];
  isFetchingNextPage: boolean;
  isReordering: boolean;
  isRefreshing: boolean;
  onDragEnd: (data: AppListCardItemType[]) => void | Promise<void>;
  onLoadMore: () => void;
  onPress: (item: AppListCardItemType) => void;
  onRefresh: () => void | Promise<void>;
};

export default function DraggableCategoryList({
  data,
  isFetchingNextPage,
  isReordering,
  isRefreshing,
  onDragEnd,
  onLoadMore,
  onPress,
  onRefresh,
}: Props) {
  const { THEME } = useThemeStore();
  const { width } = useWindowDimensions();
  const [activeKey, setActiveKey] = useState<string>();
  const orderBeforeDrag = useRef("");
  const cardWidth = Math.floor(
    (width - GRID_GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT,
  );
  const cardHeight = cardWidth - 12;
  const gridItemHeight = cardHeight + GRID_GAP;
  const gridData = useMemo<GridCategoryItem[]>(
    () =>
      data.map((item) => ({
        ...item,
        key: item.id.toString(),
        disabledDrag: isReordering,
      })),
    [data, isReordering],
  );

  const renderItem = (item: GridCategoryItem) => {
    const isActive = activeKey === item.key;

    return (
      <Surface
        elevation={isActive ? 5 : 3}
        style={[
          styles.card,
          {
            backgroundColor: isActive
              ? THEME.tertiaryContainer
              : THEME.surfaceContainer,
            height: cardHeight,
            width: cardWidth,
          },
        ]}
      >
        <View
          accessible
          accessibilityRole="button"
          accessibilityLabel={item.label}
          accessibilityHint="Tap to edit. Long press and drag to reorder."
          style={styles.cardContent}
        >
          {item.isEditable === false && (
            <View style={styles.editIndicator}>
              <PencilOff size={16} color={THEME.error} />
            </View>
          )}
          {item.description && (
            <View style={styles.infoIndicator}>
              <Tooltip title={item.description}>
                <Info size={20} color={THEME.tertiary} />
              </Tooltip>
            </View>
          )}
          <AppIcon name={item.icon} size={30} />
          <AppSpacer height={4} />
          <AppText
            variant="bodySmall"
            numberOfLines={2}
            style={[styles.label, { color: THEME.primary }]}
          >
            {item.label}
          </AppText>
        </View>
      </Surface>
    );
  };

  const handleDragRelease = (orderedItems: GridCategoryItem[]) => {
    setActiveKey(undefined);
    const nextOrder = orderedItems.map(({ key }) => key).join(",");
    if (nextOrder === orderBeforeDrag.current) return;

    void onDragEnd(
      orderedItems.map(
        ({ key: _key, disabledDrag: _disabledDrag, ...item }) => item,
      ),
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.hint}>
        <AppIcon name="Grip" size={18} color={THEME.primary} />
        <AppText variant="bodyMedium" style={{ color: THEME.onSurfaceVariant }}>
          Hold and drag a card to change its position.
        </AppText>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={({ nativeEvent }) => {
          const distanceFromEnd =
            nativeEvent.contentSize.height -
            nativeEvent.layoutMeasurement.height -
            nativeEvent.contentOffset.y;
          if (distanceFromEnd < 120) onLoadMore();
        }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        scrollEnabled={!activeKey}
        scrollEventThrottle={200}
      >
        {gridData.length ? (
          <DraggableGrid
            key={`category-grid-${Math.round(width)}`}
            data={gridData}
            delayLongPress={180}
            itemHeight={gridItemHeight}
            numColumns={COLUMN_COUNT}
            onDragItemActive={({ key }) => {
              orderBeforeDrag.current = gridData
                .map(({ key: itemKey }) => itemKey)
                .join(",");
              setActiveKey(key.toString());
            }}
            onDragRelease={handleDragRelease}
            onItemPress={onPress}
            renderItem={renderItem}
            style={styles.grid}
          />
        ) : (
          <AppEmpty />
        )}
        {isFetchingNextPage && (
          <ActivityIndicator style={styles.footerLoader} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hint: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 96,
    paddingTop: 16,
  },
  grid: {
    marginHorizontal: GRID_HORIZONTAL_MARGIN,
  },
  card: {
    borderRadius: 8,
    overflow: "hidden",
  },
  cardContent: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    padding: 12,
    width: "100%",
  },
  editIndicator: {
    bottom: 4,
    position: "absolute",
    right: 4,
  },
  infoIndicator: {
    position: "absolute",
    right: 4,
    top: 4,
  },
  label: {
    fontSize: 14,
    textAlign: "center",
  },
  footerLoader: {
    marginVertical: 12,
  },
});
