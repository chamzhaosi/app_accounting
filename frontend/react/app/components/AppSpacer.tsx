import { DimensionValue, View } from "react-native";

type AppSpacerProps = {
  height?: DimensionValue;
  width?: DimensionValue;
};

export default function AppSpacer({
  height = 20,
  width = "100%",
}: AppSpacerProps) {
  return <View style={{ height: height, width: width }} />;
}
