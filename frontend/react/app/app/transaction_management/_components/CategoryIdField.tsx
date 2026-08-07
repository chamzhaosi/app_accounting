import { Control, Controller } from "react-hook-form";
import { useWindowDimensions, View } from "react-native";
import AppFloatingButton from "../../../components/AppFloatingButton";
import AppListCardView, {
  AppListCardItemType,
} from "../../../components/AppListCardView";
import AppText, { TextTypEnum } from "../../../components/AppText";
import { TransactionManagementFormType } from "../../../forms/schemas/transaction_management.schema";
import { useKeyboardVisible } from "../../../hook/useKeyboardVisible";
import { useThemeStore } from "../../../stores/useThemeStore";
import { TXN_TYPE_ENUM } from "../../../constants/enum";

type CategoryIdFieldProps = {
  categoryItems: AppListCardItemType[];
  control: Control<TransactionManagementFormType>;
  error: Error | null;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onManageCategories: () => void;
  transactionType: TransactionManagementFormType["transactionType"];
};

export default function CategoryIdField({
  categoryItems,
  control,
  error: queryError,
  isFetchingNextPage,
  isLoading,
  onLoadMore,
  onManageCategories,
  transactionType,
}: CategoryIdFieldProps) {
  const isKeyboardVisible = useKeyboardVisible();
  const { THEME } = useThemeStore();
  const { height: screenHeight } = useWindowDimensions();

  if (transactionType === TXN_TYPE_ENUM.TRANSFER) return <></>;

  return (
    <Controller
      control={control}
      name="categoryId"
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <View className="my-4">
          <AppText variant="titleMedium" className="mb-2">
            Category
          </AppText>

          <View
            style={{
              maxHeight: screenHeight * (isKeyboardVisible ? 0.15 : 0.3),
              borderRadius: 10,
              alignItems: "center",
              backgroundColor: THEME.surfaceContainerHighest,
            }}
          >
            {queryError && (
              <AppText type={TextTypEnum.ERROR} className="mb-4">
                Unable to load categories.
              </AppText>
            )}
            <AppListCardView
              isLoading={isLoading || isFetchingNextPage}
              data={categoryItems}
              numberItemInRow={3}
              selectedItemId={value || undefined}
              onPress={(item) => {
                onChange(item.id.toString());
                onBlur();
              }}
              contentContainerStyle={{ padding: 0 }}
              containerStyle={{
                borderColor: THEME.onPrimaryContainer,
                borderWidth: 1,
              }}
              elevation={0}
              onEndReached={onLoadMore}
              onEndReachedThreshold={0.5}
              enableAutomaticScroll={false}
              extraHeight={0}
              extraScrollHeight={0}
              keyboardDismissMode="on-drag"
              style={{ marginBottom: 0 }}
            />
            <AppFloatingButton
              icon="pencil"
              size="small"
              onPress={onManageCategories}
              style={{ bottom: 0, margin: 8, zIndex: 10 }}
            />
          </View>

          {error && (
            <AppText type={TextTypEnum.ERROR} className="mt-1">
              {error.message}
            </AppText>
          )}
        </View>
      )}
    />
  );
}
