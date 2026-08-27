import { useState } from "react";
import { type Control, Controller } from "react-hook-form";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Surface,
  TouchableRipple,
} from "react-native-paper";
import type { AppListCardItemType } from "../../../components/AppListCardView";
import AppFloatingButton from "../../../components/AppFloatingButton";
import AppIcon from "../../../components/AppIcon";
import AppText, { TextTypEnum } from "../../../components/AppText";
import { TXN_TYPE_ENUM } from "../../../constants/enum";
import type { TransactionManagementFormType } from "../../../forms/schemas/transaction_management.schema";
import { useTranslation } from "../../../i18n/helper";
import { useThemeStore } from "../../../stores/useThemeStore";

type CategoryCardPickerProps = {
  categoryItems: AppListCardItemType[];
  errorMessage?: string;
  isLoading?: boolean;
  label?: string;
  onChange: (categoryId: string) => void;
  onManageCategories?: () => void;
  queryError?: Error | null;
  value: string;
};

export function CategoryCardPicker({
  categoryItems,
  errorMessage,
  isLoading = false,
  label = "Category",
  onChange,
  onManageCategories,
  queryError,
  value,
}: CategoryCardPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const selectedCategory = categoryItems.find(
    (category) => category.id.toString() === value,
  );

  return (
    <View style={styles.section}>
      <View>
        <TouchableRipple
          accessibilityRole="button"
          accessibilityLabel={t(
            isExpanded ? "Collapse category picker" : "Expand category picker",
          )}
          onPress={() => setIsExpanded((current) => !current)}
          style={[
            styles.header,
            {
              backgroundColor: THEME.surfaceContainerHigh,
              borderColor: errorMessage
                ? THEME.error
                : isExpanded
                  ? THEME.primary
                  : THEME.outline,
              borderWidth: isExpanded ? 2 : 1,
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLabel}>
              {selectedCategory && (
                <AppIcon name={selectedCategory.icon} size={24} />
              )}
              <View style={styles.headerText}>
                <AppText variant="labelMedium">{t(label)}</AppText>
                <AppText
                  variant="bodyLarge"
                  numberOfLines={1}
                  style={{
                    color: selectedCategory
                      ? THEME.onSurface
                      : THEME.onSurfaceVariant,
                  }}
                >
                  {selectedCategory?.label ?? t("Please select")}
                </AppText>
              </View>
            </View>
            <AppIcon
              name={isExpanded ? "ChevronUp" : "ChevronDown"}
              color={THEME.onSurfaceVariant}
              size={22}
            />
          </View>
        </TouchableRipple>
      </View>

      {isExpanded && (
        <View style={styles.panel}>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator
            style={[
              styles.grid,
              {
                backgroundColor: THEME.surfaceContainerHighest,
                borderColor: THEME.outlineVariant,
              },
            ]}
            contentContainerStyle={[
              styles.gridContent,
              onManageCategories && styles.gridContentWithButton,
            ]}
          >
            {categoryItems.map((category) => {
              const isSelected = category.id.toString() === value;
              return (
                <Surface
                  key={category.id}
                  elevation={isSelected ? 2 : 0}
                  style={[
                    styles.card,
                    {
                      backgroundColor: isSelected
                        ? THEME.tertiary
                        : THEME.surfaceContainer,
                      borderColor: isSelected
                        ? THEME.tertiary
                        : THEME.outlineVariant,
                    },
                  ]}
                >
                  <TouchableRipple
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={category.label}
                    onPress={() => {
                      onChange(category.id.toString());
                      setIsExpanded(false);
                    }}
                    style={styles.cardButton}
                  >
                    <View style={styles.cardContent}>
                      <AppIcon
                        name={category.icon}
                        size={30}
                        color={isSelected ? THEME.onTertiary : undefined}
                      />
                      <AppText
                        variant="bodySmall"
                        numberOfLines={2}
                        style={[
                          styles.cardLabel,
                          {
                            color: isSelected
                              ? THEME.onTertiary
                              : THEME.primary,
                          },
                        ]}
                      >
                        {category.label}
                      </AppText>
                    </View>
                  </TouchableRipple>
                </Surface>
              );
            })}

            {!isLoading && !categoryItems.length && (
              <AppText style={{ color: THEME.onSurfaceVariant }}>
                {t("No data")}
              </AppText>
            )}
            {isLoading && <ActivityIndicator size="small" />}
          </ScrollView>
          {onManageCategories && (
            <AppFloatingButton
              icon="pencil"
              size="small"
              accessibilityLabel={t("Manage Categories")}
              onPress={onManageCategories}
              style={styles.manageButton}
            />
          )}
        </View>
      )}

      {errorMessage && (
        <AppText type={TextTypEnum.ERROR} style={styles.message}>
          {t(errorMessage)}
        </AppText>
      )}
      {queryError && (
        <AppText type={TextTypEnum.ERROR} style={styles.message}>
          Unable to load categories.
        </AppText>
      )}
    </View>
  );
}

type CategoryIdFieldProps = {
  categoryItems: AppListCardItemType[];
  control: Control<TransactionManagementFormType>;
  error: Error | null;
  isLoading: boolean;
  onManageCategories: () => void;
  transactionType: TransactionManagementFormType["transactionType"];
};

export default function CategoryIdField({
  categoryItems,
  control,
  error: queryError,
  isLoading,
  onManageCategories,
  transactionType,
}: CategoryIdFieldProps) {
  if (transactionType === TXN_TYPE_ENUM.TRANSFER) return null;

  return (
    <Controller
      control={control}
      name="categoryId"
      render={({ field, fieldState: { error } }) => (
        <CategoryCardPicker
          categoryItems={categoryItems}
          errorMessage={error?.message}
          isLoading={isLoading}
          onChange={(categoryId) => {
            field.onChange(categoryId);
            field.onBlur();
          }}
          onManageCategories={onManageCategories}
          queryError={queryError}
          value={field.value}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexBasis: "30%",
    flexGrow: 1,
    maxWidth: "31.5%",
    overflow: "hidden",
  },
  cardButton: { flex: 1 },
  cardContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 8,
  },
  cardLabel: { marginTop: 4, textAlign: "center" },
  grid: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    maxHeight: 320,
  },
  gridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 10,
  },
  gridContentWithButton: { paddingBottom: 68 },
  header: {
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    minHeight: 56,
    overflow: "hidden",
  },
  headerContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  headerLabel: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  headerText: { flex: 1 },
  manageButton: { bottom: 8, margin: 0, right: 8 },
  message: { marginTop: 4 },
  panel: { position: "relative" },
  section: { marginBottom: 16 },
});
