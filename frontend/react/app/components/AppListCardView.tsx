import { LucideIcon, PencilOff } from "lucide-react-native";
import { FlatList, FlatListProps, Pressable, View } from "react-native";
import { useThemeStore } from "../stores/useThemeStore";
import { cn } from "../utils/common";
import AppSpacer from "./AppSpacer";
import AppText from "./AppText";
import {
  KeyboardAwareFlatList,
  KeyboardAwareFlatListProps,
} from "react-native-keyboard-aware-scroll-view";

export type AppListCardItemType = {
  id: string;
  label: string;
  icon: LucideIcon;
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
  ...props
}: AppListViewType) {
  const { THEME } = useThemeStore();

  return (
    <KeyboardAwareFlatList
      refreshing={false}
      onRefresh={() => {
        console.log("refresh");
      }}
      className={cn("m-4", className)}
      numColumns={isShowIconOnly ? 6 : 4}
      columnWrapperStyle={{
        justifyContent: "flex-start",
        gap: 16,
        marginBottom: 16,
      }}
      data={data}
      keyExtractor={(item) => item.id}
      enableOnAndroid
      extraScrollHeight={extraScrollHeight ?? 40}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => {
        const Icon = item.icon;

        return (
          <Pressable
            onPress={() => onPress(item)}
            className={cn(
              "w-[22%] max-h-[100px] px-2 py-3 rounded-md justify-center items-center relative",
              "bg-LIGHT-LIST_ITEM_BG active:bg-LIGHT-LIST_ITEM_BG_PRESSED",
              "dark:bg-DARK-LIST_ITEM_BG dark:active:bg-DARK-LIST_ITEM_BG_PRESSED",
              `${isShowIconOnly ? "w-[13%]" : ""}`,
              `${selectedId === item.id ? "bg-LIGHT-LIST_ITEM_BG_PRESSED dark:bg-DARK-LIST_ITEM_BG_PRESSED" : ""}`,
              itemClassName,
            )}
          >
            {!item.isEditable && (
              <View className="absolute top-1 right-1">
                <PencilOff size={12} color={THEME.TEXT_ERROR} />
              </View>
            )}
            <Icon color={THEME.TEXT_PRIMARY} />
            <AppSpacer height={4} />
            {!isShowIconOnly && (
              <AppText
                className="text-sm dark:text-DARK-TEXT_PRIMARY text-justify"
                numberOfLines={3}
              >
                {item.label}
              </AppText>
            )}
          </Pressable>
        );
      }}
      {...props}
    />
  );
}
