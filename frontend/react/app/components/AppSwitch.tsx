import { forwardRef } from "react";
import { Switch as RNSwitch, StyleSheet, View } from "react-native";
import { Switch, SwitchProps } from "react-native-paper";
import { SWITCH_LABEL_FONTSIZE } from "../constants/common";
import AppText from "./AppText";

type AppSwitchProps = SwitchProps & {
  label: string;
};

const AppSwitch = forwardRef<RNSwitch, AppSwitchProps>(
  ({ label, ...props }, ref) => {
    return (
      <View className="flex-row items-center mx-1 my-2 justify-between">
        <AppText style={[defaultStyle.swtichLbl]}>{label}</AppText>
        <Switch ref={ref} {...props} style={[defaultStyle.swtichBtn]} />
      </View>
    );
  },
);

AppSwitch.displayName = "AppSwitch";

export default AppSwitch;

const defaultStyle = StyleSheet.create({
  swtichLbl: {
    fontSize: SWITCH_LABEL_FONTSIZE,
  },
  swtichBtn: {
    marginRight: 4,
    transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }],
  },
});
