import { useMemo, useRef, useState } from "react";
import {
  LayoutRectangle,
  StyleProp,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Menu, TextInput, TextInputProps } from "react-native-paper";
import {
  SELECT_OPTIONS_CONTAINER_HEIGHT_MAX,
  SELECT_OPTIONS_CONTAINER_HEIGHT_MIN,
  SELECT_OPTIONS_ITEM_HEIGHT,
  TEXTINPUT_FONTSIZE,
  TEXTINPUT_HEIGHT,
} from "../constants/size";
import { useThemeStore } from "../stores/useThemeStore";
import AppIcon, { AppIconProps } from "./AppIcon";
import { FieldError } from "react-hook-form";
import AppText, { TextTypEnum } from "./AppText";
import { useTranslation } from "../i18n/helper";

export type SelectOptionType = {
  id: number | string;
  icon?: AppIconProps["name"];
  label: string;
  value: string;
};

type AppSelectProps = TextInputProps & {
  label: string;
  value: string;
  options: SelectOptionType[];
  onChange: (value: number | string | null) => void;
  errorField?: FieldError;
  showClear: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  shouldTranslateText?: boolean;
};

export default function AppSelect({
  label,
  value,
  options,
  onChange,
  mode,
  errorField,
  showClear = false,
  containerStyle,
  shouldTranslateText = true,
  ...textInputProps
}: AppSelectProps) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const textInputRef = useRef<RNTextInput>(null);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [textInputLayout, setTextInputLayout] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const selectedLabel =
    options.find((o) => o.id.toString() === value)?.label ?? "";

  const isEmptyOptions = options.length === 0;
  const totalOptionsHeight = options.length * SELECT_OPTIONS_ITEM_HEIGHT;
  const ACTUAL_OPTIONS_CONTAINER_HEIGHT = isEmptyOptions
    ? SELECT_OPTIONS_CONTAINER_HEIGHT_MIN
    : Math.min(totalOptionsHeight, SELECT_OPTIONS_CONTAINER_HEIGHT_MAX);
  const menuWidth = useMemo(
    () => textInputLayout.width,
    [textInputLayout.width],
  );

  const rightIcon =
    selectedLabel && showClear ? (
      <TextInput.Icon icon={"close"} onPress={() => onChange(null)} />
    ) : (
      <TextInput.Icon
        icon={showOptions ? "menu-down" : "menu-up"}
        rippleColor="transparent"
        onPress={() => setShowOptions(true)}
      />
    );

  return (
    <View style={containerStyle}>
      <Menu
        visible={showOptions}
        elevation={4}
        anchorPosition="bottom"
        onDismiss={() => {
          textInputRef.current?.blur();
          setShowOptions(false);
        }}
        style={{
          marginTop: -8,
          width: menuWidth,
        }}
        contentStyle={[
          defaultStyle.menuContent,
          {
            backgroundColor: THEME.surfaceContainer,
            borderColor: THEME.outlineVariant,
            maxWidth: menuWidth,
            minWidth: menuWidth,
            width: menuWidth,
          },
        ]}
        anchor={
          <View
            className="mb-4"
            onLayout={({ nativeEvent }) =>
              setTextInputLayout(nativeEvent.layout)
            }
          >
            <TextInput
              ref={textInputRef}
              label={shouldTranslateText ? t(label) : label}
              value={selectedLabel}
              onPress={() => setShowOptions(true)}
              placeholder={
                shouldTranslateText ? t("Please select") : "Please select"
              }
              showSoftInputOnFocus={false}
              error={!!errorField?.message}
              caretHidden
              right={rightIcon}
              mode={mode ?? "outlined"}
              style={[
                defaultStyle.textInput,
                {
                  backgroundColor: THEME.surfaceContainerHigh,
                },
              ]}
              {...textInputProps}
            />
          </View>
        }
      >
        <View style={{ width: menuWidth }}>
          <ScrollView
            style={[
              defaultStyle.optionsContainer,
              {
                backgroundColor: THEME.surfaceContainer,
                height: ACTUAL_OPTIONS_CONTAINER_HEIGHT,
                width: menuWidth,
              },
            ]}
            contentContainerStyle={defaultStyle.optionsContent}
          >
            {isEmptyOptions ? (
              <Menu.Item
                title={shouldTranslateText ? t("No data") : "No data"}
                leadingIcon={() => (
                  <AppIcon name="PackageOpen" color={THEME.outlineVariant} />
                )}
                style={[
                  defaultStyle.emptyItem,
                  { width: Math.max(menuWidth - 12, 0) },
                ]}
                titleStyle={{
                  color: THEME.onSurfaceVariant,
                }}
              />
            ) : (
              options.map((i) => {
                const isOptSelected = i.id.toString() === value;
                const itemIcon = i.icon
                  ? () => (
                      <AppIcon
                        name={i.icon!}
                        color={
                          isOptSelected ? THEME.onPrimaryContainer : undefined
                        }
                      />
                    )
                  : undefined;
                const selectedIcon = () =>
                  isOptSelected ? (
                    <AppIcon name="Check" color={THEME.onPrimaryContainer} />
                  ) : undefined;

                return (
                  <Menu.Item
                    key={i.id}
                    title={i.label}
                    onPress={() => {
                      onChange(i.id);
                      setShowOptions(false);
                    }}
                    leadingIcon={itemIcon}
                    trailingIcon={selectedIcon}
                    contentStyle={defaultStyle.menuItemContent}
                    rippleColor={THEME.surfaceContainerHighest}
                    dense={false}
                    style={[
                      defaultStyle.menuItemContainer,
                      {
                        backgroundColor: isOptSelected
                          ? THEME.primaryContainer
                          : THEME.surfaceContainer,
                      },
                    ]}
                    titleStyle={{
                      color: isOptSelected
                        ? THEME.onPrimaryContainer
                        : THEME.onSurface,
                      fontWeight: isOptSelected ? "700" : "400",
                    }}
                  />
                );
              })
            )}
          </ScrollView>
        </View>
      </Menu>
      {errorField?.message && (
        <AppText
          style={{ marginTop: -8 }}
          type={TextTypEnum.ERROR}
          shouldTranslateText={shouldTranslateText}
        >
          {t(errorField.message)}
        </AppText>
      )}
    </View>
  );
}

const defaultStyle = StyleSheet.create({
  textInput: {
    height: TEXTINPUT_HEIGHT,
    fontSize: TEXTINPUT_FONTSIZE,
  },
  menuContent: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  optionsContainer: {
    borderRadius: 8,
  },
  optionsContent: {
    paddingInline: 6,
  },
  emptyItem: {
    alignSelf: "stretch",
    borderRadius: 10,
    marginHorizontal: 6,
  },
  menuItemContainer: {
    alignSelf: "stretch",
    borderRadius: 4,
    height: SELECT_OPTIONS_ITEM_HEIGHT,
    marginHorizontal: 6,
    marginVertical: 2,
  },
  menuItemContent: {
    flex: 1,
  },
});
