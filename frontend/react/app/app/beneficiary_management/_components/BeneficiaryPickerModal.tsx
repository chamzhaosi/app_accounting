import { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Modal, Portal, Text } from "react-native-paper";
import AppEmpty from "../../../components/AppEmpty";
import AppFloatingButton from "../../../components/AppFloatingButton";
import AppIcon, { type AppIconProps } from "../../../components/AppIcon";
import AppIconButton from "../../../components/AppIconButton";
import AppText from "../../../components/AppText";
import { useTranslation } from "../../../i18n/helper";
import type {
  BeneficiaryFilterOptionType,
  BeneficiaryType,
} from "../../../sql/types/beneficiaryType";
import { useThemeStore } from "../../../stores/useThemeStore";
import BeneficiaryGridCard from "./BeneficiaryGridCard";

type BeneficiarySection = {
  type: BeneficiaryType;
  title: string;
  icon: AppIconProps["name"];
  data: BeneficiaryFilterOptionType[];
};

type Props = {
  allowInactiveSelection?: boolean;
  beneficiaries: BeneficiaryFilterOptionType[];
  disabled?: boolean;
  multiple?: boolean;
  onDismiss: () => void;
  onManage?: () => void;
  onSelect: (beneficiary: BeneficiaryFilterOptionType) => void;
  selectedIds: string[];
  visible: boolean;
};

export default function BeneficiaryPickerModal({
  allowInactiveSelection = false,
  beneficiaries,
  disabled = false,
  multiple = false,
  onDismiss,
  onManage,
  onSelect,
  selectedIds,
  visible,
}: Props) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const sections = useMemo<BeneficiarySection[]>(() => {
    const individuals = beneficiaries.filter(
      (beneficiary) => beneficiary.type === "INDIVIDUAL",
    );
    const groups = beneficiaries.filter(
      (beneficiary) => beneficiary.type === "GROUP",
    );

    return [
      {
        type: "INDIVIDUAL" as const,
        title: "Individuals",
        icon: "CircleUserRound" as const,
        data: individuals,
      },
      {
        type: "GROUP" as const,
        title: "Groups",
        icon: "UsersRound" as const,
        data: groups,
      },
    ].filter((section) => section.data.length > 0);
  }, [beneficiaries]);

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
          <AppText variant="titleLarge">{t("Select beneficiary")}</AppText>
          <AppIconButton iconName="X" onPress={onDismiss} />
        </View>

        {sections.length ? (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator
          >
            {sections.map((section) => (
              <View key={section.type}>
                <View
                  style={[
                    styles.sectionHeader,
                    {
                      backgroundColor: THEME.surfaceContainerHigh,
                      borderBottomColor: THEME.outlineVariant,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.sectionIcon,
                      { backgroundColor: THEME.primaryContainer },
                    ]}
                  >
                    <AppIcon
                      name={section.icon}
                      color={THEME.onPrimaryContainer}
                      size={20}
                    />
                  </View>
                  <Text style={styles.sectionTitle}>{t(section.title)}</Text>
                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: THEME.surfaceContainerHighest },
                    ]}
                  >
                    <Text
                      variant="labelMedium"
                      style={{ color: THEME.onSurfaceVariant }}
                    >
                      {section.data.length}
                    </Text>
                  </View>
                </View>
                <View style={styles.grid}>
                  {section.data.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isDisabled =
                      disabled ||
                      (!allowInactiveSelection &&
                        !item.is_active &&
                        !isSelected);

                    return (
                      <BeneficiaryGridCard
                        key={item.id}
                        beneficiary={item}
                        columns={3}
                        selected={isSelected}
                        disabled={isDisabled}
                        role={multiple ? "checkbox" : "radio"}
                        subtitle={
                          item.is_self
                            ? t("Self")
                            : (item.relationship ?? undefined)
                        }
                        variant="management"
                        onPress={() => onSelect(item)}
                      />
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyListContent}>
            <AppEmpty />
          </View>
        )}

        {onManage ? (
          <AppFloatingButton
            icon="pencil"
            accessibilityLabel={t("Manage beneficiaries")}
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
  content: { borderRadius: 12, overflow: "hidden" },
  countBadge: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  emptyListContent: { flexGrow: 1, justifyContent: "center" },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 10,
  },
  listContent: { paddingBottom: 80 },
  manageButton: { bottom: 0 },
  modal: { alignItems: "center", justifyContent: "center" },
  sectionHeader: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionIcon: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
});
