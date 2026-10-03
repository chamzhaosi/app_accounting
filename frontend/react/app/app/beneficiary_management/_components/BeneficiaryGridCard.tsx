import { Info } from "lucide-react-native";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { Surface, Text, Tooltip, TouchableRipple } from "react-native-paper";
import AppIcon, { type AppIconProps } from "../../../components/AppIcon";
import { useTranslation } from "../../../i18n/helper";
import type { BeneficiaryFilterOptionType } from "../../../sql/types/beneficiaryType";
import { useThemeStore } from "../../../stores/useThemeStore";

type Props = {
  beneficiary: BeneficiaryFilterOptionType;
  selected?: boolean;
  disabled?: boolean;
  columns?: 3 | 4;
  highlightSelf?: boolean;
  variant?: "compact" | "management";
  role?: ComponentProps<typeof TouchableRipple>["accessibilityRole"];
  subtitle?: string;
  onPress: () => void;
};

export default function BeneficiaryGridCard({
  beneficiary,
  selected = false,
  disabled = false,
  columns = 4,
  highlightSelf = false,
  variant = "compact",
  role = "button",
  subtitle,
  onPress,
}: Props) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const description = beneficiary.descriptions?.trim();
  const cardSubtitle = beneficiary.is_active ? subtitle : t("Inactive");
  const isManagement = variant === "management";
  const isSelfHighlighted = highlightSelf && beneficiary.is_self && !selected;
  const foregroundColor = selected
    ? THEME.onTertiary
    : isSelfHighlighted
      ? THEME.onPrimaryContainer
      : THEME.primary;

  return (
    <Surface
      elevation={isManagement ? 3 : selected || isSelfHighlighted ? 2 : 1}
      style={[
        styles.card,
        columns === 3 ? styles.threeColumnCard : styles.fourColumnCard,
        {
          backgroundColor: selected
            ? THEME.tertiary
            : isSelfHighlighted
              ? THEME.primaryContainer
              : THEME.surfaceContainer,
          borderColor: selected
            ? THEME.tertiary
            : isSelfHighlighted
              ? THEME.primary
              : THEME.outlineVariant,
          opacity: beneficiary.is_active ? (disabled ? 0.6 : 1) : 0.55,
        },
      ]}
    >
      <TouchableRipple
        accessibilityRole={role}
        accessibilityState={{
          checked:
            role === "checkbox" || role === "radio" ? selected : undefined,
          disabled,
        }}
        accessibilityLabel={`${beneficiary.name}${
          cardSubtitle ? `, ${cardSubtitle}` : ""
        }`}
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.button,
          isManagement ? styles.managementButton : undefined,
        ]}
      >
        <>
          {description ? (
            <View
              style={[
                styles.info,
                isManagement ? styles.managementInfo : undefined,
              ]}
            >
              <Tooltip title={description}>
                <Info
                  accessibilityLabel={description}
                  size={isManagement ? 20 : 16}
                  color={
                    selected
                      ? THEME.onTertiary
                      : isSelfHighlighted
                        ? THEME.onPrimaryContainer
                        : THEME.tertiary
                  }
                />
              </Tooltip>
            </View>
          ) : null}
          <AppIcon
            name={beneficiary.icon as AppIconProps["name"]}
            size={isManagement ? 30 : 24}
            color={selected || isSelfHighlighted ? foregroundColor : undefined}
          />
          <Text
            variant="bodySmall"
            numberOfLines={cardSubtitle ? 1 : 2}
            style={[
              styles.label,
              isManagement ? styles.managementLabel : undefined,
              { color: foregroundColor },
            ]}
          >
            {beneficiary.name}
          </Text>
          {cardSubtitle ? (
            <Text
              variant="labelSmall"
              numberOfLines={1}
              style={{
                color:
                  selected || isSelfHighlighted
                    ? foregroundColor
                    : THEME.onSurfaceVariant,
              }}
            >
              {cardSubtitle}
            </Text>
          ) : null}
        </>
      </TouchableRipple>
    </Surface>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 6,
  },
  card: {
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexGrow: 1,
    overflow: "hidden",
  },
  fourColumnCard: { flexBasis: "22%", maxWidth: "23%" },
  info: { position: "absolute", right: 4, top: 4, zIndex: 1 },
  label: { marginTop: 4, textAlign: "center" },
  managementButton: { padding: 12 },
  managementInfo: { right: 6, top: 6 },
  managementLabel: { fontSize: 14 },
  threeColumnCard: { flexBasis: "30%", maxWidth: "31.5%" },
});
