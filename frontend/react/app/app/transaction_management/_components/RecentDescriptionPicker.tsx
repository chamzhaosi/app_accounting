import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "../../../i18n/helper";
import { useThemeStore } from "../../../stores/useThemeStore";

type RecentDescriptionPickerProps = {
  descriptions: string[];
  value: string;
  maxLength: number;
  disabled?: boolean;
  onSelect: (description: string) => void;
};

export default function RecentDescriptionPicker({
  descriptions,
  value,
  maxLength,
  disabled = false,
  onSelect,
}: RecentDescriptionPickerProps) {
  const { t } = useTranslation();
  const { THEME } = useThemeStore();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ x: 0, animated: false });
  }, [descriptions]);

  if (descriptions.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: THEME.outline,
          backgroundColor: THEME.surfaceContainerHigh,
        },
      ]}
    >
      <View style={styles.header}>
        <Text variant="labelSmall" style={{ color: THEME.onSurfaceVariant }}>
          {t("Frequently used")}
        </Text>
        <Text variant="labelSmall" style={{ color: THEME.onSurfaceVariant }}>
          {value.length}/{maxLength}
        </Text>
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {descriptions.map((description) => {
          const isSelected = value === description;

          return (
            <Pressable
              key={description}
              accessibilityRole="button"
              accessibilityState={{ disabled, selected: isSelected }}
              disabled={disabled}
              style={[
                styles.badge,
                {
                  backgroundColor: isSelected
                    ? THEME.primaryContainer
                    : THEME.surfaceContainerHighest,
                  opacity: disabled ? 0.6 : 1,
                },
              ]}
              onPress={() => {
                scrollViewRef.current?.scrollTo({ x: 0, animated: false });
                onSelect(description);
              }}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  color: isSelected
                    ? THEME.onPrimaryContainer
                    : THEME.onSurface,
                }}
              >
                {description}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    maxWidth: 200,
    paddingHorizontal: 12,
  },
  container: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderTopWidth: 0,
    borderWidth: 1,
    marginBottom: 10,
    marginTop: -1,
    paddingBottom: 8,
    paddingTop: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  scrollContent: { gap: 8, paddingLeft: 8, paddingRight: 16 },
  scrollView: { display: "flex", flexGrow: 0 },
});
