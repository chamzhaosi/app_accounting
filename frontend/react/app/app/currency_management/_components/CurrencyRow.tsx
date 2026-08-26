import { memo } from "react";
import { StyleSheet, View } from "react-native";
import {
  Checkbox,
  RadioButton,
  Surface,
  Text,
  TouchableRipple,
} from "react-native-paper";
import type { CurrencyDefinition } from "../../../constants/currencies";
import { useTranslation } from "../../../i18n/helper";
import { useThemeStore } from "../../../stores/useThemeStore";

type CurrencyRowProps = {
  currency: CurrencyDefinition;
  disabled: boolean;
  isDefault: boolean;
  isEnabled: boolean;
  onSelectDefault: (code: string) => void;
  onToggle: (code: string) => void;
};

function CurrencyRow({
  currency,
  disabled,
  isDefault,
  isEnabled,
  onSelectDefault,
  onToggle,
}: CurrencyRowProps) {
  const { t } = useTranslation();
  const { THEME } = useThemeStore();

  return (
    <Surface
      elevation={isDefault ? 2 : 0}
      style={[
        styles.container,
        {
          backgroundColor: isDefault
            ? THEME.primaryContainer
            : THEME.surfaceContainer,
          borderColor: isDefault ? THEME.primary : THEME.outlineVariant,
        },
      ]}
    >
      <TouchableRipple
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: isEnabled,
          disabled: disabled || isDefault,
        }}
        accessibilityLabel={`${t("Enable")} ${currency.code} ${currency.name}`}
        disabled={disabled || isDefault}
        onPress={() => onToggle(currency.code)}
        style={styles.currencyTouchTarget}
      >
        <View style={styles.currencyContent}>
          <Checkbox.Android
            status={isEnabled ? "checked" : "unchecked"}
            disabled={disabled || isDefault}
          />
          <View style={styles.details}>
            <View style={styles.titleRow}>
              <Text variant="titleMedium" style={styles.code}>
                {currency.code}
              </Text>
              <Text variant="titleMedium" numberOfLines={1} style={styles.name}>
                {currency.name}
              </Text>
              <Text variant="titleMedium">{currency.symbol}</Text>
            </View>
            <Text
              variant="bodySmall"
              numberOfLines={2}
              style={{ color: THEME.onSurfaceVariant }}
            >
              {currency.countries.join(", ")}
            </Text>
          </View>
        </View>
      </TouchableRipple>

      <TouchableRipple
        accessibilityRole="radio"
        accessibilityState={{ checked: isDefault, disabled }}
        accessibilityLabel={`${t("Set as default")} ${currency.code}`}
        disabled={disabled}
        onPress={() => onSelectDefault(currency.code)}
        style={[
          styles.defaultTouchTarget,
          { borderLeftColor: THEME.outlineVariant },
        ]}
      >
        <View style={styles.defaultContent}>
          <RadioButton.Android
            value={currency.code}
            status={isDefault ? "checked" : "unchecked"}
            disabled={disabled}
            onPress={() => onSelectDefault(currency.code)}
          />
          <Text variant="labelSmall">
            {isDefault ? t("Default") : t("Make default")}
          </Text>
        </View>
      </TouchableRipple>
    </Surface>
  );
}

export default memo(CurrencyRow);

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 8,
    overflow: "hidden",
  },
  currencyTouchTarget: {
    flex: 1,
  },
  currencyContent: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 86,
    paddingRight: 8,
  },
  details: {
    flex: 1,
    paddingVertical: 10,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  code: {
    fontWeight: "700",
  },
  name: {
    flex: 1,
  },
  defaultTouchTarget: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    width: 84,
  },
  defaultContent: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 86,
    paddingHorizontal: 4,
  },
});
