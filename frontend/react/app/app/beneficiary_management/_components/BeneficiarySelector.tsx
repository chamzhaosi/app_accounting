import { useState } from "react";
import { Keyboard, Pressable, StyleSheet, View } from "react-native";
import { HelperText, Surface, Text } from "react-native-paper";
import AppFloatingButton from "../../../components/AppFloatingButton";
import AppIcon, { type AppIconProps } from "../../../components/AppIcon";
import AppIconButton from "../../../components/AppIconButton";
import { useTranslation } from "../../../i18n/helper";
import type { BeneficiaryFilterOptionType } from "../../../sql/types/beneficiaryType";
import { useThemeStore } from "../../../stores/useThemeStore";
import BeneficiaryGridCard from "./BeneficiaryGridCard";
import BeneficiaryPickerModal from "./BeneficiaryPickerModal";

type Props = {
  label: string;
  beneficiaries: BeneficiaryFilterOptionType[];
  selectedIds: string[];
  multiple?: boolean;
  allowInactiveSelection?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  headerLayout?: "default" | "category";
  individualsOnly?: boolean;
  optionLayout?: "inline" | "grid";
  presentation?: "inline" | "modal";
  onChange: (ids: string[]) => void;
  onAdd?: () => void;
  onManage?: () => void;
};

export default function BeneficiarySelector({
  label,
  beneficiaries,
  selectedIds,
  multiple = false,
  allowInactiveSelection = false,
  disabled = false,
  errorMessage,
  headerLayout = "default",
  individualsOnly = false,
  optionLayout = "inline",
  presentation = "inline",
  onChange,
  onAdd,
  onManage,
}: Props) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const selected = beneficiaries.filter((item) =>
    selectedIds.includes(item.id),
  );
  const groups = individualsOnly
    ? []
    : beneficiaries.filter((item) => item.type === "GROUP");
  const individuals = beneficiaries.filter(
    (item) => item.type === "INDIVIDUAL",
  );
  const selectedBeneficiary = selected[0];
  const selectedLabel = selected.length
    ? selected.map((item) => item.name).join(", ")
    : t(
        multiple
          ? "Select members"
          : headerLayout === "category"
            ? "Please select"
            : "Select beneficiary",
      );

  const toggle = (beneficiary: BeneficiaryFilterOptionType) => {
    if (
      disabled ||
      (!allowInactiveSelection &&
        !beneficiary.is_active &&
        !selectedIds.includes(beneficiary.id))
    )
      return;
    if (!multiple) {
      onChange([beneficiary.id]);
      setExpanded(false);
      return;
    }
    onChange(
      selectedIds.includes(beneficiary.id)
        ? selectedIds.filter((id) => id !== beneficiary.id)
        : [...selectedIds, beneficiary.id],
    );
  };

  const renderSection = (
    title: string,
    items: BeneficiaryFilterOptionType[],
  ) => {
    if (!items.length) return null;
    return (
      <View style={styles.section}>
        {optionLayout !== "grid" ? (
          <Text variant="labelLarge" style={{ color: THEME.onSurfaceVariant }}>
            {t(title)}
          </Text>
        ) : null}
        <View
          style={[
            styles.options,
            optionLayout === "grid" ? styles.gridOptions : undefined,
          ]}
        >
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isDisabled =
              disabled ||
              (!allowInactiveSelection && !item.is_active && !isSelected);

            if (optionLayout === "grid") {
              return (
                <BeneficiaryGridCard
                  key={item.id}
                  beneficiary={item}
                  selected={isSelected}
                  disabled={isDisabled}
                  role={multiple ? "checkbox" : "radio"}
                  onPress={() => toggle(item)}
                />
              );
            }

            return (
              <Pressable
                key={item.id}
                accessibilityRole={multiple ? "checkbox" : "radio"}
                accessibilityState={{
                  checked: isSelected,
                  disabled: isDisabled,
                }}
                accessibilityLabel={`${item.name}${
                  item.is_active ? "" : ` (${t("Inactive")})`
                }`}
                disabled={isDisabled}
                onPress={() => toggle(item)}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: isSelected
                      ? THEME.tertiaryContainer
                      : THEME.surfaceContainerHighest,
                    borderColor: isSelected
                      ? THEME.primary
                      : THEME.outlineVariant,
                    opacity: item.is_active ? 1 : 0.55,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <AppIcon
                  name={item.icon as AppIconProps["name"]}
                  size={18}
                  color={isSelected ? THEME.primary : THEME.onSurfaceVariant}
                />
                <Text numberOfLines={1} style={styles.optionText}>
                  {item.name}
                  {!item.is_active ? ` (${t("Inactive")})` : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <BeneficiaryPickerModal
        beneficiaries={[...individuals, ...groups]}
        disabled={disabled}
        allowInactiveSelection={allowInactiveSelection}
        multiple={multiple}
        selectedIds={selectedIds}
        visible={presentation === "modal" && expanded}
        onDismiss={() => setExpanded(false)}
        onSelect={toggle}
        onManage={
          onManage
            ? () => {
                setExpanded(false);
                onManage();
              }
            : undefined
        }
      />
      {headerLayout === "default" ? (
        <Text variant="labelMedium" style={{ color: THEME.onSurfaceVariant }}>
          {t(label)}
        </Text>
      ) : null}
      <Surface
        elevation={0}
        style={[
          styles.container,
          headerLayout === "category" ? styles.categoryContainer : undefined,
          presentation === "modal" ? styles.modalHeaderContainer : undefined,
          {
            backgroundColor:
              headerLayout === "category"
                ? THEME.surfaceContainerHigh
                : THEME.surfaceContainer,
            borderColor: errorMessage
              ? THEME.error
              : headerLayout === "category" && expanded
                ? THEME.primary
                : THEME.outline,
            borderWidth: headerLayout === "category" && expanded ? 2 : 1,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(label)}
          accessibilityState={{ expanded, disabled }}
          disabled={disabled}
          onPress={() => {
            Keyboard.dismiss();
            setExpanded((value) => !value);
          }}
          style={[
            styles.summary,
            headerLayout === "category" ? styles.categorySummary : undefined,
          ]}
        >
          {headerLayout === "category" ? (
            <View style={styles.categoryHeaderContent}>
              <View style={styles.categoryHeaderLabel}>
                {selectedBeneficiary ? (
                  <AppIcon
                    name={selectedBeneficiary.icon as AppIconProps["name"]}
                    size={24}
                  />
                ) : null}
                <View style={styles.categoryHeaderText}>
                  <Text variant="labelMedium">{t(label)}</Text>
                  <Text
                    variant="bodyLarge"
                    numberOfLines={1}
                    style={{
                      color: selected.length
                        ? THEME.onSurface
                        : THEME.onSurfaceVariant,
                    }}
                  >
                    {selectedLabel}
                  </Text>
                </View>
              </View>
              <AppIcon
                name={expanded ? "ChevronUp" : "ChevronDown"}
                color={THEME.onSurfaceVariant}
                size={22}
              />
            </View>
          ) : (
            <>
              <Text numberOfLines={1} style={styles.summaryText}>
                {selectedLabel}
              </Text>
              <AppIcon
                name={expanded ? "ChevronUp" : "ChevronDown"}
                size={20}
              />
            </>
          )}
        </Pressable>
        {expanded && presentation === "inline" ? (
          <View
            style={[
              styles.panel,
              (onAdd || onManage) && optionLayout === "grid"
                ? styles.gridPanelWithManage
                : undefined,
              { borderTopColor: THEME.outlineVariant },
            ]}
          >
            {onManage && optionLayout !== "grid" ? (
              <View style={styles.manageRow}>
                <AppIconButton
                  iconName="Pencil"
                  iconSize={18}
                  accessibilityLabel={t("Manage beneficiaries")}
                  onPress={onManage}
                />
              </View>
            ) : null}
            {renderSection("Individuals", individuals)}
            {renderSection("Groups", groups)}
            {(onAdd || onManage) && optionLayout === "grid" ? (
              <AppFloatingButton
                icon={onAdd ? "plus" : "pencil"}
                size="small"
                accessibilityLabel={t(
                  onAdd ? "Add Individual" : "Manage beneficiaries",
                )}
                disabled={disabled}
                onPress={onAdd ?? onManage}
                style={styles.manageButton}
              />
            ) : null}
          </View>
        ) : null}
      </Surface>
      {errorMessage ? (
        <HelperText type="error" visible accessibilityLiveRegion="polite">
          {t(errorMessage)}
        </HelperText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  categoryContainer: { borderRadius: 4 },
  categoryHeaderContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryHeaderLabel: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  categoryHeaderText: { flex: 1 },
  categorySummary: { flex: 1, minHeight: 0, paddingHorizontal: 12 },
  container: { borderRadius: 8, borderWidth: 1, overflow: "hidden" },
  gridOptions: { gap: 8 },
  gridPanelWithManage: { paddingBottom: 64 },
  manageButton: { bottom: 8, margin: 0, right: 8 },
  manageRow: { alignItems: "flex-end" },
  modalHeaderContainer: { height: 56 },
  option: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 6,
    maxWidth: "100%",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  optionText: { flexShrink: 1 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  panel: { borderTopWidth: StyleSheet.hairlineWidth, padding: 12 },
  pressed: { opacity: 0.75 },
  section: { marginBottom: 12 },
  summary: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 52,
    padding: 12,
  },
  summaryText: { flex: 1 },
  wrapper: { marginBottom: 16 },
});
