import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { FONTS } from "../../../constants/fonts";
import { LIST_ITEM_DESCRIPTION_FONTSIZE } from "../../../constants/size";
import { useThemeStore } from "../../../stores/useThemeStore";

type TransactionMetadataLineProps = {
  beneficiaryLabel?: string;
  description?: string;
};

export default function TransactionMetadataLine({
  beneficiaryLabel,
  description,
}: TransactionMetadataLineProps) {
  const { THEME } = useThemeStore();

  if (!description && !beneficiaryLabel) return null;

  const textStyle = [styles.text, { color: THEME.onSurfaceVariant }];

  return (
    <View style={styles.row}>
      {description ? (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[textStyle, styles.description]}
        >
          {description}
        </Text>
      ) : null}
      {description && beneficiaryLabel ? (
        <Text style={[textStyle, styles.separator]}> · </Text>
      ) : null}
      {beneficiaryLabel ? (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            textStyle,
            styles.beneficiary,
            description ? styles.beneficiaryWithDescription : undefined,
          ]}
        >
          {beneficiaryLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  beneficiary: { flexShrink: 0 },
  beneficiaryWithDescription: { maxWidth: "70%" },
  description: { flexShrink: 1, minWidth: 0 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 2,
    minWidth: 0,
  },
  separator: { flexShrink: 0 },
  text: {
    fontFamily: FONTS.ROBOTO,
    fontSize: LIST_ITEM_DESCRIPTION_FONTSIZE - 2,
  },
});
