import { type ReactNode, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Surface, TouchableRipple } from "react-native-paper";
import AppIcon from "../../../components/AppIcon";
import type { SelectOptionType } from "../../../components/AppSelect";
import AppText from "../../../components/AppText";
import { useTranslation } from "../../../i18n/helper";
import { useThemeStore } from "../../../stores/useThemeStore";

type TransactionSearchCategoryPickerProps = {
  categories: SelectOptionType[];
  leadingControl: ReactNode;
  onChange: (categoryIds: string[]) => void;
  value: string[];
};

export default function TransactionSearchCategoryPicker({
  categories,
  leadingControl,
  onChange,
  value,
}: TransactionSearchCategoryPickerProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedCategories = categories.filter((category) =>
    value.includes(category.id.toString()),
  );
  const selectedCategory = selectedCategories[0];
  const selectedLabel =
    selectedCategories.length > 1
      ? t("{{count}} selected", { count: selectedCategories.length })
      : selectedCategory?.label;
  const groups = ["Income", "Expense"] as const;

  return (
    <View>
      <View style={styles.fieldRow}>
        <View style={styles.fieldColumn}>{leadingControl}</View>
        <View style={styles.fieldColumn}>
          <TouchableRipple
            accessibilityRole="button"
            accessibilityLabel={t(
              isExpanded
                ? "Collapse category picker"
                : "Expand category picker",
            )}
            onPress={() => setIsExpanded((current) => !current)}
            style={[
              styles.field,
              {
                backgroundColor: THEME.surfaceContainerHigh,
                borderColor: isExpanded ? THEME.primary : THEME.outline,
                borderWidth: isExpanded ? 2 : 1,
              },
            ]}
          >
            <View style={styles.fieldContent}>
              <View style={styles.fieldLabel}>
                {selectedCategory?.icon ? (
                  <AppIcon name={selectedCategory.icon} size={22} />
                ) : null}
                <View style={styles.fieldText}>
                  <AppText variant="labelMedium">{t("Category")}</AppText>
                  <AppText
                    variant="bodyLarge"
                    numberOfLines={1}
                    style={{
                      color: selectedCategory
                        ? THEME.onSurface
                        : THEME.onSurfaceVariant,
                    }}
                  >
                    {selectedLabel ?? t("Please select")}
                  </AppText>
                </View>
              </View>
              {selectedCategory ? (
                <TouchableRipple
                  accessibilityRole="button"
                  accessibilityLabel={t("Clear category")}
                  borderless
                  onPress={() => onChange([])}
                  style={styles.clearButton}
                >
                  <AppIcon name="X" size={18} color={THEME.onSurfaceVariant} />
                </TouchableRipple>
              ) : (
                <AppIcon
                  name={isExpanded ? "ChevronUp" : "ChevronDown"}
                  size={22}
                  color={THEME.onSurfaceVariant}
                />
              )}
            </View>
          </TouchableRipple>
        </View>
      </View>

      {isExpanded ? (
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator
          style={[
            styles.panel,
            {
              backgroundColor: THEME.surfaceContainerHighest,
              borderColor: THEME.outlineVariant,
            },
          ]}
          contentContainerStyle={styles.panelContent}
        >
          {groups.map((group) => {
            const groupCategories = categories.filter(
              (category) => category.groupLabel === group,
            );
            if (!groupCategories.length) return null;

            return (
              <View key={group}>
                <AppText
                  variant="titleSmall"
                  style={[styles.groupLabel, { color: THEME.primary }]}
                >
                  {t(group)}
                </AppText>
                <View style={styles.grid}>
                  {groupCategories.map((category) => {
                    const categoryId = category.id.toString();
                    const isSelected = value.includes(categoryId);
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
                            onChange(
                              isSelected
                                ? value.filter((id) => id !== categoryId)
                                : [...value, categoryId],
                            );
                          }}
                          style={styles.cardButton}
                        >
                          <View style={styles.cardContent}>
                            {category.icon ? (
                              <AppIcon
                                name={category.icon}
                                size={28}
                                color={
                                  isSelected ? THEME.onTertiary : THEME.primary
                                }
                              />
                            ) : null}
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
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldRow: { alignItems: "stretch", gap: 12 },
  fieldColumn: { minWidth: 0, width: "100%" },
  field: { borderRadius: 4, minHeight: 56, overflow: "hidden" },
  fieldContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  fieldLabel: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },
  fieldText: { flex: 1, minWidth: 0 },
  clearButton: {
    alignItems: "center",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  panel: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    height: 320,
    marginTop: 8,
  },
  panelContent: {
    padding: 10,
  },
  groupLabel: { fontWeight: "700", marginBottom: 8, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
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
});
