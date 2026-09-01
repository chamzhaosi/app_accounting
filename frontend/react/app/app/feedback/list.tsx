import { Linking, StyleSheet, View } from "react-native";
import AppView from "../../components/AppView";
import { useTranslation } from "../../i18n/helper";
import { List } from "react-native-paper";
import AppIcon from "../../components/AppIcon";
import { router } from "expo-router";
import { useThemeStore } from "../../stores/useThemeStore";
import { GOOGLE_PLAY_REVIEW_URL } from "../../constants/urls";

export default function FeedbackList() {
  const { t } = useTranslation();
  const { THEME } = useThemeStore();

  const feedbackItems = [
    {
      id: "rate-finora",
      icon: "Sparkle" as const,
      rightIcon: "ExternalLink" as const,
      label: t("Rate Finora"),
      description: t("Share your experience on Google Play"),
      onPress: () => Linking.openURL(GOOGLE_PLAY_REVIEW_URL),
    },
    {
      id: "report-a-problem",
      icon: "Bug" as const,
      rightIcon: "Mail" as const,
      label: t("Report a Problem"),
      description: t("Tell us what went wrong"),
      onPress: () =>
        router.push({
          pathname: "/feedback/report",
          params: { type: "bug" },
        }),
    },
    {
      id: "suggest-an-idea",
      icon: "Lightbulb" as const,
      rightIcon: "Mail" as const,
      label: t("Suggest an Idea"),
      description: t("Share an idea for Finora"),
      onPress: () =>
        router.push({
          pathname: "/feedback/report",
          params: { type: "suggest" },
        }),
    },
  ];

  return (
    <AppView
      className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow"
      style={styles.container}
    >
      <View style={[styles.card, { backgroundColor: THEME.surfaceContainer }]}>
        {feedbackItems.map((item, index) => (
          <View key={item.id}>
            <List.Item
              centered
              style={styles.item}
              title={item.label}
              titleStyle={[styles.itemTitle, { color: THEME.onSurface }]}
              description={item.description}
              descriptionStyle={{ color: THEME.onSurfaceVariant }}
              rippleColor={THEME.surfaceContainerHighest}
              left={() => (
                <View style={styles.itemIcon}>
                  <AppIcon name={item.icon} size={24} />
                </View>
              )}
              right={() => (
                <View style={styles.rightIcon}>
                  <AppIcon
                    name={item.rightIcon}
                    color={THEME.onSurfaceVariant}
                    size={20}
                  />
                </View>
              )}
              onPress={item.onPress}
            />
            {index < feedbackItems.length - 1 && (
              <View
                style={[
                  styles.separator,
                  { backgroundColor: THEME.outlineVariant },
                ]}
              />
            )}
          </View>
        ))}
      </View>
    </AppView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  item: {
    minHeight: 72,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  itemTitle: {
    fontSize: 16,
  },
  itemIcon: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    marginRight: 4,
    width: 40,
  },
  rightIcon: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 64,
  },
});
