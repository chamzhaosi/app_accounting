import { forwardRef } from "react";
import { Switch as RNSwitch, StyleSheet, View } from "react-native";
import { Switch, SwitchProps } from "react-native-paper";
import { SWITCH_LABEL_FONTSIZE } from "../constants/size";
import AppText from "./AppText";
import { useTranslation } from "../i18n/helper";

type AppSwitchProps = SwitchProps & {
  label: string;
  description?: string;
};

const AppSwitch = forwardRef<RNSwitch, AppSwitchProps>(
  ({ label, description, disabled, ...props }, ref) => {
    const { t } = useTranslation();
    return (
      <View className="flex-row items-center mx-1 my-2 justify-between">
        <View
          style={[
            defaultStyle.labelContainer,
            disabled && defaultStyle.disabledLabel,
          ]}
        >
          <AppText style={[defaultStyle.swtichLbl]}>{t(label)}</AppText>
          {description && (
            <AppText style={defaultStyle.description}>{t(description)}</AppText>
          )}
        </View>
        <Switch
          ref={ref}
          disabled={disabled}
          {...props}
          style={[defaultStyle.swtichBtn]}
        />
      </View>
    );
  },
);

AppSwitch.displayName = "AppSwitch";

export default AppSwitch;

const defaultStyle = StyleSheet.create({
  description: { fontSize: 12, opacity: 0.7 },
  disabledLabel: { opacity: 0.38 },
  labelContainer: { flex: 1, marginRight: 12 },
  swtichLbl: {
    fontSize: SWITCH_LABEL_FONTSIZE,
  },
  swtichBtn: {
    marginRight: 4,
    transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }],
  },
});
