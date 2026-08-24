import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import { IconButton, List, Modal, Portal, Text } from "react-native-paper";
import AppEmpty from "../../../components/AppEmpty";
import AppIcon, { AppIconProps } from "../../../components/AppIcon";
import type { BudgetManageCategoryType } from "../../../sql/types/budgetType";
import { useThemeStore } from "../../../stores/useThemeStore";
import { useTranslation } from "../../../i18n";
import { getCategoryDisplayLabel } from "../../../utils/category";

type BudgetCategoryPickerModalProps = {
  categories: BudgetManageCategoryType[];
  visible: boolean;
  onDismiss: () => void;
  onSelect: (category: BudgetManageCategoryType) => void;
};

export default function BudgetCategoryPickerModal({
  categories,
  visible,
  onDismiss,
  onSelect,
}: BudgetCategoryPickerModalProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.container,
          {
            backgroundColor: THEME.surfaceContainerHigh,
            maxHeight: height * 0.7,
            width: width * 0.9,
          },
        ]}
      >
        <View style={styles.header}>
          <Text variant="titleLarge">{t("Choose expense category")}</Text>
          <IconButton
            icon="close"
            accessibilityLabel={t("Close category picker")}
            onPress={onDismiss}
          />
        </View>
        <FlatList
          data={categories}
          keyExtractor={(category) => category.category_id}
          ListEmptyComponent={<AppEmpty />}
          contentContainerStyle={
            categories.length === 0 ? styles.emptyContent : undefined
          }
          renderItem={({ item }) => (
            <List.Item
              title={getCategoryDisplayLabel(
                item.label,
                item.translation_key,
                t,
              )}
              style={{ backgroundColor: THEME.surfaceContainer }}
              onPress={() => onSelect(item)}
              left={({ style }) => (
                <View style={[style, styles.iconContainer]}>
                  <AppIcon name={item.icon as AppIconProps["name"]} size={22} />
                </View>
              )}
              right={({ style }) => (
                <View style={[style, styles.iconContainer]}>
                  <AppIcon name="Plus" size={22} color={THEME.primary} />
                </View>
              )}
            />
          )}
        />
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
  },
  emptyContent: { flexGrow: 1, justifyContent: "center" },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 16,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
