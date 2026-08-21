import { Children, ReactNode, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useThemeStore } from "../stores/useThemeStore";

type AppSwipePagerProps = {
  children: ReactNode;
};

export default function AppSwipePager({ children }: AppSwipePagerProps) {
  const pages = Children.toArray(children);
  const { width } = useWindowDimensions();
  const { THEME } = useThemeStore();
  const [page, setPage] = useState(0);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.round(event.nativeEvent.contentOffset.x / width));

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {pages.map((item, index) => (
          <View key={index} style={{ width }}>
            {item}
          </View>
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  page === index ? THEME.primary : THEME.outlineVariant,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { borderRadius: 4, height: 7, width: 7 },
  pagination: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginBottom: 4,
  },
});
