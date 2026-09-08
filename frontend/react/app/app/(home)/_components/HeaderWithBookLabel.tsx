import { StyleProp, TextStyle, View } from "react-native";
import { Text } from "react-native-paper";
import { useThemeStore } from "../../../stores/useThemeStore";
import { useTranslation } from "../../../i18n/helper";
import BookContextIndicator from "../../../components/BookContextIndicator";

export default function HeaderWithBookLabel({
  switchable = false,
  title,
  textStyle,
}: {
  switchable?: boolean;
  title: string;
  textStyle?: StyleProp<TextStyle>;
}) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Text
        style={[
          {
            color: THEME.primary,
            fontSize: 28,
            fontWeight: "700",
          },
          textStyle,
        ]}
      >
        {t(title)}
      </Text>
      <BookContextIndicator switchable={switchable} />
    </View>
  );
}
