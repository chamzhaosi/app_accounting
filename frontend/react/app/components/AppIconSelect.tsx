import { forwardRef, useState } from "react";
import { FieldError } from "react-hook-form";
import { Keyboard, StyleSheet } from "react-native";
import { TouchableRipple, TouchableRippleProps } from "react-native-paper";
import { TEXTINPUT_FONTSIZE } from "../constants/size";
import { useThemeStore } from "../stores/useThemeStore";
import AppIcon, { AppIconProps } from "./AppIcon";
import AppIconModal from "./AppIconModal";
import AppText, { TextTypEnum } from "./AppText";
import { useTranslation } from "../i18n";

const formatIconLabel = (icon: AppIconProps["name"]) =>
  icon.replace(/([a-z0-9])([A-Z])/g, "$1 $2");

type AppIconSelectProps = {
  error?: FieldError;
  onChange: (value: AppIconProps["name"]) => void;
  value: AppIconProps["name"];
  onBlur: () => void;
  icons: AppIconProps["name"][];
  iconTags?: Partial<Record<AppIconProps["name"], readonly string[]>>;
  editable: boolean;
  disabled: boolean;
};

const AppIconSelect = forwardRef<any, AppIconSelectProps>(
  (
    {
      value,
      onChange,
      onBlur,
      error,
      icons = [],
      iconTags = {},
      editable,
      disabled,
    },
    ref,
  ) => {
    const { THEME } = useThemeStore();
    const { t } = useTranslation();
    const isError = error?.message;
    const isAvailabled = editable && !disabled;

    const [isShowIconModal, setIsShowIconModal] = useState<boolean>(false);

    const sytle: TouchableRippleProps["style"] = value
      ? {
          backgroundColor: isAvailabled
            ? THEME.tertiary
            : THEME.surfaceDisabled,
        }
      : {
          borderColor: isAvailabled
            ? isError
              ? THEME.error
              : THEME.outline
            : THEME.surfaceDisabled,
          backgroundColor: THEME.surfaceContainerHigh,
          ...defaultStyle.iconContainer,
        };

    const genIconData = (icons: AppIconProps["name"][]) => {
      if (!icons.length) return [];
      return icons.map((icon) => ({
        id: icon,
        label: formatIconLabel(icon),
        icon,
        searchTerms: iconTags[icon],
      }));
    };

    const onPress = isAvailabled
      ? () => {
          setIsShowIconModal(true);
          Keyboard.dismiss();
        }
      : undefined;

    return (
      <>
        <AppIconModal
          iconData={genIconData(icons)}
          visible={isShowIconModal}
          onDismiss={() => setIsShowIconModal(false)}
          selectedIcon={value}
          onSelectedIcon={onChange}
        />
        <TouchableRipple
          ref={ref}
          className="relative h-full items-center justify-center rounded-lg mt-2"
          style={sytle}
          onPress={onPress}
        >
          <>
            {value && (
              <AppIcon name={value} size={38} color={THEME.onTertiary} />
            )}

            {!isError && !value && (
              <AppText
                style={[
                  defaultStyle.placeholder,
                  {
                    color: isAvailabled
                      ? THEME.onSurfaceVariant
                      : THEME.onSurfaceDisabled,
                  },
                ]}
              >
                {t("Icon")}
              </AppText>
            )}
          </>
        </TouchableRipple>
        {isError && isAvailabled && (
          <AppText
            onPress={onPress}
            style={defaultStyle.errorMsg}
            type={TextTypEnum.ERROR}
          >
            {t(error.message ?? "")}
          </AppText>
        )}
      </>
    );
  },
);

AppIconSelect.displayName = "AppIconSelect";

export default AppIconSelect;

const defaultStyle = StyleSheet.create({
  iconContainer: {
    borderStyle: "dashed",
    borderWidth: 2,
  },
  errorMsg: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  placeholder: {
    fontSize: TEXTINPUT_FONTSIZE,
  },
});
