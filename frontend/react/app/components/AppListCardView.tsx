import { LucideIcon, PencilOff } from "lucide-react-native";
import { useWindowDimensions, View } from "react-native";
import {
  KeyboardAwareFlatList,
  KeyboardAwareFlatListProps,
} from "react-native-keyboard-aware-scroll-view";
import { Surface, TouchableRipple } from "react-native-paper";
import { useThemeStore } from "../stores/useThemeStore";
import { cn } from "../utils/common";
import AppSpacer from "./AppSpacer";
import AppText from "./AppText";

export type AppListCardItemType = {
  id: string;
  label: string;
  icon: string;
  description?: string;
  isEditable?: boolean;
};

type AppListViewType = Omit<
  KeyboardAwareFlatListProps<AppListCardItemType>,
  "renderItem"
> & {
  data: AppListCardItemType[];
  className?: string;
  itemClassName?: string;
  isShowIconOnly?: boolean;
  selectedId?: string;
  getItemIcon: (name: string) => LucideIcon;
  onPress: (item: AppListCardItemType) => void;
};

export default function AppListCardView({
  data,
  className,
  itemClassName,
  isShowIconOnly,
  selectedId,
  onPress,
  extraScrollHeight,
  onRefresh,
  getItemIcon,
  ...props
}: AppListViewType) {
  const { THEME } = useThemeStore();
  const { width } = useWindowDimensions();

  const itemNumInRow = isShowIconOnly ? 6 : 4;
  const itemSize = Math.floor((width - 16 * (itemNumInRow + 1)) / itemNumInRow);

  return (
    <KeyboardAwareFlatList
      refreshing={false}
      onRefresh={onRefresh}
      className={cn(className)}
      numColumns={itemNumInRow}
      columnWrapperStyle={{
        justifyContent: "flex-start",
        marginBottom: 16,
        gap: 16,
      }}
      contentContainerStyle={{
        padding: 16,
      }}
      data={data}
      keyExtractor={(item) => item.id}
      enableOnAndroid
      extraScrollHeight={extraScrollHeight ?? 40}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => {
        const Icon = getItemIcon(item.icon);
        const isItemSelected = selectedId === item.id;

        return (
          <Surface
            style={{
              height: itemSize,
              width: itemSize,
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: isItemSelected
                ? THEME.tertiary
                : THEME.surfaceContainer,
            }}
            elevation={3}
          >
            <TouchableRipple
              onPress={() => onPress(item)}
              rippleColor={THEME.surfaceContainerHighest}
              style={{
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
                borderRadius: "8px",
              }}
            >
              <>
                {!item.isEditable && (
                  <View className="absolute top-1 right-1">
                    <PencilOff size={12} color={THEME.error} />
                  </View>
                )}
                <Icon
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
      }}
      {...props}
    />
  );
}
