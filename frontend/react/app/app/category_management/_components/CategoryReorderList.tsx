import { ArrowLeftRight, Check, Info, PencilOff, X } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  ActivityIndicator,
  IconButton,
  Surface,
  Tooltip,
} from "react-native-paper";
import AppEmpty from "../../../components/AppEmpty";
import AppIcon from "../../../components/AppIcon";
import type { AppListCardItemType } from "../../../components/AppListCardView";
import AppSpacer from "../../../components/AppSpacer";
import AppText from "../../../components/AppText";
import { useThemeStore } from "../../../stores/useThemeStore";
import {
  CATEGORY_LIST_LOAD_MORE_THRESHOLD,
  CATEGORY_LIST_SCROLL_EVENT_THROTTLE,
  CATEGORY_REORDER_GRID,
  CATEGORY_REORDER_ICON_SIZE,
} from "./categoryManagement.constants";
import { swapCategoryItems } from "./categoryReorderList.utils";
import { useTranslation } from "../../../i18n";

type Props = {
  data: AppListCardItemType[];
  hasOrderChanges: boolean;
  isAdjusting: boolean;
  isFetchingNextPage: boolean;
  isReordering: boolean;
  isRefreshing: boolean;
  onCancel: () => void;
  onLoadMore: () => void;
  onOrderChange: (data: AppListCardItemType[]) => void | Promise<void>;
  onPress: (item: AppListCardItemType) => void;
  onRefresh: () => void | Promise<void>;
  onSave: () => void | Promise<void>;
};

export default function CategoryReorderList({
  data,
  hasOrderChanges,
  isAdjusting,
  isFetchingNextPage,
  isReordering,
  isRefreshing,
  onCancel,
  onLoadMore,
  onOrderChange,
  onPress,
  onRefresh,
  onSave,
}: Props) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [selectedKey, setSelectedKey] = useState<string>();
  const cardWidth = Math.floor(
    (width -
      CATEGORY_REORDER_GRID.gap * (CATEGORY_REORDER_GRID.columnCount + 1)) /
      CATEGORY_REORDER_GRID.columnCount,
  );
  const cardHeight = cardWidth - CATEGORY_REORDER_GRID.cardHeightOffset;
  const gridItemHeight = cardHeight + CATEGORY_REORDER_GRID.gap;
  const gridItemWidth = Math.floor(
    (width - CATEGORY_REORDER_GRID.gap) / CATEGORY_REORDER_GRID.columnCount,
  );

  const handleItemPress = (item: AppListCardItemType) => {
    const itemKey = item.id.toString();
    if (!isAdjusting) {
      onPress(item);
      return;
    }
    if (!selectedKey) {
      setSelectedKey(itemKey);
      return;
    }
    if (selectedKey === itemKey) {
      setSelectedKey(undefined);
      return;
    }

    const reorderedItems = swapCategoryItems(data, selectedKey, itemKey);
    if (!reorderedItems) return;
    setSelectedKey(undefined);
    void onOrderChange(reorderedItems);
  };

  const renderItem = (item: AppListCardItemType) => {
    const itemKey = item.id.toString();
    const isSelected = selectedKey === itemKey;

    return (
      <Pressable
        accessibilityHint={
          isAdjusting
            ? isSelected
              ? t("Selected. Tap another card to swap positions.")
              : t("Tap to select this card for swapping.")
            : t("Tap to edit.")
        }
        accessibilityLabel={item.label}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        disabled={isReordering}
        key={itemKey}
        onPress={() => handleItemPress(item)}
        style={[
          styles.gridItem,
          { height: gridItemHeight, width: gridItemWidth },
        ]}
      >
        <Surface
          elevation={isSelected ? 5 : 3}
          style={[
            styles.card,
            {
              backgroundColor: isSelected
                ? THEME.tertiaryContainer
                : THEME.surfaceContainer,
              height: cardHeight,
              width: cardWidth,
            },
          ]}
        >
          <View style={styles.cardContent}>
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
      </Pressable>
    );
  };

  return (
    <View style={styles.root}>
      {isAdjusting && (
        <View style={styles.hint}>
          <View style={styles.hintCopy}>
            <ArrowLeftRight
              size={CATEGORY_REORDER_ICON_SIZE}
              color={THEME.primary}
            />
            <AppText
              variant="bodySmall"
              style={[styles.hintText, { color: THEME.onSurfaceVariant }]}
            >
              {t("Tap two cards to swap, then save.")}
            </AppText>
          </View>
          <View style={styles.actions}>
            <Tooltip title={t("Cancel")}>
              <IconButton
                accessibilityLabel={t("Cancel category reordering")}
                disabled={isReordering}
                icon={({ color, size }) => <X color={color} size={size} />}
                iconColor={THEME.error}
                onPress={() => {
                  setSelectedKey(undefined);
                  onCancel();
                }}
                size={18}
                style={styles.actionIcon}
              />
            </Tooltip>
            <Tooltip title={t("Save order")}>
              <IconButton
                accessibilityLabel={t("Save category order")}
                disabled={!hasOrderChanges || isReordering}
                icon={({ color, size }) => <Check color={color} size={size} />}
                iconColor={THEME.primary}
                loading={isReordering}
                onPress={() => {
                  setSelectedKey(undefined);
                  void onSave();
                }}
                size={18}
                style={styles.actionIcon}
              />
            </Tooltip>
          </View>
        </View>
      )}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isAdjusting && styles.adjustingScrollContent,
        ]}
        onScroll={({ nativeEvent }) => {
          const distanceFromEnd =
            nativeEvent.contentSize.height -
            nativeEvent.layoutMeasurement.height -
            nativeEvent.contentOffset.y;
          if (
            !isAdjusting &&
            distanceFromEnd < CATEGORY_LIST_LOAD_MORE_THRESHOLD
          )
            onLoadMore();
        }}
        refreshControl={
          isAdjusting ? undefined : (
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          )
        }
        scrollEventThrottle={CATEGORY_LIST_SCROLL_EVENT_THROTTLE}
      >
        {data.length ? (
          <View style={styles.grid}>{data.map(renderItem)}</View>
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
    gap: 4,
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  hintCopy: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 4,
  },
  hintText: {
    flex: 1,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 0,
  },
  actionIcon: {
    margin: 0,
  },
  scrollContent: {
    paddingBottom: 96,
    paddingTop: 16,
  },
  adjustingScrollContent: {
    paddingTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: CATEGORY_REORDER_GRID.horizontalMargin,
  },
  gridItem: {
    alignItems: "center",
    justifyContent: "center",
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
