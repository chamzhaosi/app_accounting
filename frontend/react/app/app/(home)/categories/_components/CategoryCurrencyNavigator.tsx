import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import AppIconButton from "../../../../components/AppIconButton";
import type { SelectOptionType } from "../../../../components/AppSelect";
import { useTranslation } from "../../../../i18n/helper";
import { useThemeStore } from "../../../../stores/useThemeStore";

type CategoryCurrencyNavigatorProps = {
  options: SelectOptionType[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
};

export default function CategoryCurrencyNavigator({
  options,
  value,
  onChange,
  style,
}: CategoryCurrencyNavigatorProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const selectedIndex = options.findIndex(
    (option) => option.value.toString() === value,
  );
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const selectedOption = options[activeIndex];
  const canSelectPrevious = activeIndex > 0;
  const canSelectNext = activeIndex < options.length - 1;

  const selectOffset = (offset: number) => {
    const nextOption = options[activeIndex + offset];
    if (nextOption) onChange(nextOption.value.toString());
  };

  return (
    <Surface
      elevation={0}
      style={[
        styles.container,
        { backgroundColor: THEME.surfaceContainerHighest },
        style,
      ]}
    >
      <AppIconButton
        iconName="ChevronLeft"
        iconSize={20}
        accessibilityLabel={t("Previous currency")}
        disabled={!canSelectPrevious}
        onPress={() => selectOffset(-1)}
        style={{
          ...styles.button,
          backgroundColor: THEME.surfaceContainerHighest,
        }}
      />
      <View style={styles.labelContainer}>
        <Text variant="labelSmall" style={{ color: THEME.onSurfaceVariant }}>
          {t("Currency")}
        </Text>
        <Text variant="titleMedium" numberOfLines={1} style={styles.value}>
          {selectedOption?.label ?? value}
        </Text>
      </View>
      <AppIconButton
        iconName="ChevronRight"
        iconSize={20}
        accessibilityLabel={t("Next currency")}
        disabled={!canSelectNext}
        onPress={() => selectOffset(1)}
        style={{
          ...styles.button,
          backgroundColor: THEME.surfaceContainerHighest,
        }}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    margin: 0,
    padding: 4,
    width: 36,
  },
  container: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    flexShrink: 0,
    minHeight: 48,
    overflow: "hidden",
    paddingHorizontal: 2,
    paddingVertical: 3,
  },
  labelContainer: {
    alignItems: "center",
    minWidth: 52,
  },
  value: {
    fontWeight: "700",
    lineHeight: 20,
    textAlign: "center",
  },
});
