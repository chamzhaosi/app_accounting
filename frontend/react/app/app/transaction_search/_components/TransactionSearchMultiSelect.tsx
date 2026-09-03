import { useState } from "react";
import {
  LayoutRectangle,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Menu, TextInput } from "react-native-paper";
import AppIcon from "../../../components/AppIcon";
import type { SelectOptionType } from "../../../components/AppSelect";
import { useTranslation } from "../../../i18n/helper";
import { useThemeStore } from "../../../stores/useThemeStore";

type TransactionSearchMultiSelectProps = {
  label: string;
  onChange: (values: string[]) => void;
  options: SelectOptionType[];
  values: string[];
};

export default function TransactionSearchMultiSelect({
  label,
  onChange,
  options,
  values,
}: TransactionSearchMultiSelectProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [layout, setLayout] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const selectedOptions = options.filter((option) =>
    values.includes(option.id.toString()),
  );
  const displayValue =
    selectedOptions.length > 1
      ? t("{{count}} selected", { count: selectedOptions.length })
      : selectedOptions[0]?.label;

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchorPosition="bottom"
      style={{ width: layout.width }}
      contentStyle={[
        styles.menu,
        {
          backgroundColor: THEME.surfaceContainer,
          borderColor: THEME.outlineVariant,
          width: layout.width,
        },
      ]}
      anchor={
        <View onLayout={({ nativeEvent }) => setLayout(nativeEvent.layout)}>
          <Pressable onPress={() => setVisible(true)}>
            <TextInput
              label={t(label)}
              value={displayValue ?? ""}
              placeholder={t("Please select")}
              editable={false}
              pointerEvents="none"
              style={{ backgroundColor: THEME.surfaceContainerHigh }}
              right={
                <TextInput.Icon
                  icon={visible ? "menu-up" : "menu-down"}
                  forceTextInputFocus={false}
                />
              }
            />
          </Pressable>
        </View>
      }
    >
      <ScrollView
        nestedScrollEnabled
        style={styles.options}
        keyboardShouldPersistTaps="handled"
      >
        {options.map((option) => {
          const optionId = option.id.toString();
          const isSelected = values.includes(optionId);
          return (
            <Menu.Item
              key={option.id}
              title={option.label}
              leadingIcon={
                option.icon
                  ? () => <AppIcon name={option.icon!} size={20} />
                  : undefined
              }
              trailingIcon={
                isSelected
                  ? () => (
                      <AppIcon name="Check" size={20} color={THEME.primary} />
                    )
                  : undefined
              }
              onPress={() =>
                onChange(
                  isSelected
                    ? values.filter((value) => value !== optionId)
                    : [...values, optionId],
                )
              }
              style={{
                backgroundColor: isSelected
                  ? THEME.primaryContainer
                  : THEME.surfaceContainer,
              }}
            />
          );
        })}
      </ScrollView>
    </Menu>
  );
}

const styles = StyleSheet.create({
  menu: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  options: { maxHeight: 280 },
});
