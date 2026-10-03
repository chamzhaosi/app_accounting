import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import {
  ActivityIndicator,
  Modal,
  Portal,
  Surface,
  TouchableRipple,
} from "react-native-paper";
import AppEmpty from "../../../components/AppEmpty";
import AppFloatingButton from "../../../components/AppFloatingButton";
import AppIcon from "../../../components/AppIcon";
import AppIconButton from "../../../components/AppIconButton";
import type { AppListCardItemType } from "../../../components/AppListCardView";
import AppText, { TextTypEnum } from "../../../components/AppText";
import { useTranslation } from "../../../i18n/helper";
import { useThemeStore } from "../../../stores/useThemeStore";

type Props = {
  categories: AppListCardItemType[];
  disabled?: boolean;
  errorMessage?: string;
  isLoading?: boolean;
  onDismiss: () => void;
  onManage?: () => void;
  onSelect: (categoryId: string) => void;
  queryError?: Error | null;
  selectedId: string;
  visible: boolean;
};

export default function CategoryPickerModal({
  categories,
  disabled = false,
  errorMessage,
  isLoading = false,
  onDismiss,
  onManage,
  onSelect,
  queryError,
  selectedId,
  visible,
}: Props) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        style={styles.modal}
        contentContainerStyle={[
          styles.content,
          {
            backgroundColor: THEME.surfaceContainer,
            height: height * 0.7,
            width: width * 0.9,
          },
        ]}
      >
        <View style={styles.header}>
          <AppText variant="titleLarge">{t("Select Category")}</AppText>
          <AppIconButton iconName="X" onPress={onDismiss} />
        </View>

        {errorMessage ? (
          <AppText type={TextTypEnum.ERROR} style={styles.message}>
            {t(errorMessage)}
          </AppText>
        ) : null}
        {queryError ? (
          <AppText type={TextTypEnum.ERROR} style={styles.message}>
            Unable to load categories.
          </AppText>
        ) : null}

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={categories}
            numColumns={3}
            keyExtractor={(item) => item.id.toString()}
            columnWrapperStyle={styles.row}
            contentContainerStyle={[
              styles.grid,
              categories.length === 0 ? styles.emptyGrid : undefined,
            ]}
            ListEmptyComponent={<AppEmpty />}
            renderItem={({ item }) => {
              const isSelected = item.id.toString() === selectedId;
              return (
                <Surface
                  elevation={isSelected ? 2 : 1}
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
                    accessibilityState={{ checked: isSelected, disabled }}
                    accessibilityLabel={item.label}
                    disabled={disabled}
                    onPress={() => onSelect(item.id.toString())}
                    style={styles.cardButton}
                  >
                    <View style={styles.cardContent}>
                      <AppIcon
                        name={item.icon}
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
                        {item.label}
                      </AppText>
                    </View>
                  </TouchableRipple>
                </Surface>
              );
            }}
            extraData={{ selectedId, disabled }}
          />
        )}

        {onManage ? (
          <AppFloatingButton
            icon="pencil"
            accessibilityLabel={t("Manage Categories")}
            disabled={disabled}
            onPress={onManage}
            style={styles.manageButton}
          />
        ) : null}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
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
  content: { borderRadius: 12, overflow: "hidden" },
  emptyGrid: { flexGrow: 1, justifyContent: "center" },
  grid: { gap: 10, padding: 10, paddingBottom: 80 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loading: { alignItems: "center", flex: 1, justifyContent: "center" },
  manageButton: { bottom: 0 },
  message: { paddingHorizontal: 12, paddingBottom: 8 },
  modal: { alignItems: "center", justifyContent: "center" },
  row: { gap: 10 },
});
