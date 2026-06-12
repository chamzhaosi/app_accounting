import { Fragment, useMemo, useRef, useState } from "react";
import {
  LayoutRectangle,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Menu, TextInput, TextInputProps } from "react-native-paper";
import {
  ICON_DEFAULT_WIDTH,
  SELECT_OPTIONS_CONTAINER_HEIGHT_MAX,
  SELECT_OPTIONS_CONTAINER_HEIGHT_MIN,
  SELECT_OPTIONS_ITEM_HEIGHT,
  TEXTINPUT_FONTSIZE,
  TEXTINPUT_HEIGHT,
} from "../constants/common";
import { useThemeStore } from "../stores/useThemeStore";
import AppIcon, { AppIconProps } from "./AccIcon";
import { FieldError } from "react-hook-form";
import AppText, { TextTypEnum } from "./AppText";
import AppDivider from "./AppDivider";

export type SelectOptionType = {
  id: number;
  icon?: AppIconProps["name"];
  label: string;
  value: string;
};

type AppSelectProps = TextInputProps & {
  label: string;
  value: string;
  options: SelectOptionType[];
  onChange: (value: number | null) => void;
  errorField?: FieldError;
  showClear: boolean;
};

export default function AppSelect({
  label,
  value,
  options,
  onChange,
  mode,
  errorField,
  showClear = false,
  ...textInputProps
}: AppSelectProps) {
  const { THEME } = useThemeStore();
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
  const minWidth = useMemo(
    () =>
      textInputLayout.width +
      ICON_DEFAULT_WIDTH +
      16 /* = Marging surrounding icon*/,
    [textInputLayout],
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
    <>
      <Menu
        visible={showOptions}
        onDismiss={() => {
          textInputRef.current?.blur();
          setShowOptions(false);
        }}
        style={{
          marginTop: textInputLayout.height,
        }}
        anchor={
          <View className="mb-4">
            <TextInput
              ref={textInputRef}
              label={label}
              value={selectedLabel}
              onPress={() => setShowOptions(true)}
              placeholder="Please select"
              showSoftInputOnFocus={false}
              error={!!errorField?.message}
              caretHidden
              right={rightIcon}
              mode={mode ?? "outlined"}
              onLayout={({ nativeEvent }) =>
                setTextInputLayout(nativeEvent.layout)
              }
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
        <ScrollView
          style={{
            height: ACTUAL_OPTIONS_CONTAINER_HEIGHT,
          }}
        >
          {isEmptyOptions ? (
            <Menu.Item
              title="No data"
              leadingIcon={() => (
                <AppIcon name="PackageOpen" color={THEME.outlineVariant} />
              )}
              style={{ minWidth }}
              contentStyle={{
                minWidth,
              }}
              titleStyle={{
                color: THEME.outlineVariant,
              }}
            />
          ) : (
            options.map((i, index) => {
              const isLastItem = options.length - 1 === index;
              const isOptSelected = i.id.toString() === value;
              const hasItemIcon = !!i.icon;
              const itemTitleMinWidth =
                minWidth - ICON_DEFAULT_WIDTH * (1 + (hasItemIcon ? 1 : 0)); // 2 = Leading and Trailing icon
              const itemIcon = () =>
                hasItemIcon ? (
                  <AppIcon
                    name={i.icon!}
                    color={isOptSelected ? THEME.onTertiary : undefined}
                  />
                ) : undefined;
              const selectedIcon = () =>
                isOptSelected ? (
                  <AppIcon name="Check" color={THEME.onTertiary} />
                ) : undefined;

              return (
                <Fragment key={i.id}>
                  <Menu.Item
                    title={i.label}
                    onPress={() => {
                      onChange(i.id);
                      setShowOptions(false);
                    }}
                    leadingIcon={itemIcon}
                    trailingIcon={selectedIcon}
                    dense={false}
                    style={[
                      defaultStyle.menuItemContainer,
                      {
                        minWidth,
                        ...(isOptSelected
                          ? {
                              backgroundColor: THEME.tertiary,
                              color: THEME.onTertiary,
                            }
                          : {}),
                      },
                    ]}
                    titleStyle={{
                      minWidth: itemTitleMinWidth,
                      ...(isOptSelected ? { color: THEME.onTertiary } : {}),
                    }}
                    contentStyle={{
                      minWidth: itemTitleMinWidth,
                    }}
                  />
                  {!isLastItem && <AppDivider />}
                </Fragment>
              );
            })
          )}
        </ScrollView>
      </Menu>
      {errorField?.message && (
        <AppText style={{ marginTop: -8 }} type={TextTypEnum.ERROR}>
          {errorField.message}
        </AppText>
      )}
    </>
  );
}

const defaultStyle = StyleSheet.create({
  textInput: {
    height: TEXTINPUT_HEIGHT,
    fontSize: TEXTINPUT_FONTSIZE,
  },
  menuItemContainer: {
    height: SELECT_OPTIONS_ITEM_HEIGHT,
  },
});
