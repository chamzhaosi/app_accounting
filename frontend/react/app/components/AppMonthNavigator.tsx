import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { formatMonthLabel, shiftMonth } from "../utils/date";

type AppMonthNavigatorProps = {
  month: string;
  onChange: (month: string) => void;
};

export default function AppMonthNavigator({
  month,
  onChange,
}: AppMonthNavigatorProps) {
  return (
    <View style={styles.container}>
      <IconButton
        icon="chevron-left"
        accessibilityLabel="Previous month"
        onPress={() => onChange(shiftMonth(month, -1))}
      />
      <View style={styles.labelContainer}>
        <Text variant="titleLarge">{formatMonthLabel(month)}</Text>
      </View>
      <IconButton
        icon="chevron-right"
        accessibilityLabel="Next month"
        onPress={() => onChange(shiftMonth(month, 1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    alignSelf: "stretch",
    flexDirection: "row",
    marginBottom: 12,
  },
  labelContainer: {
    alignItems: "center",
    flex: 1,
  },
});
