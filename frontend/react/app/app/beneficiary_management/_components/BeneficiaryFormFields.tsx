import { Controller, type Control } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import AppIconSelect from "../../../components/AppIconSelect";
import type { AppIconProps } from "../../../components/AppIcon";
import AppSwitch from "../../../components/AppSwitch";
import AppTextInput from "../../../components/AppTextInput";
import { ICONS } from "../../../constants/icons";
import {
  BENEFICIARY_DESCRIPTION_MAX_LEN,
  BENEFICIARY_NAME_MAX_LEN,
  BENEFICIARY_RELATIONSHIP_MAX_LEN,
  BENEFICIARY_RELATIONSHIP_SUGGESTIONS,
  type BeneficiaryFormType,
} from "../../../forms/schemas/beneficiary.schema";
import { useTranslation } from "../../../i18n/helper";
import type {
  BeneficiaryRspType,
  BeneficiaryType,
} from "../../../sql/types/beneficiaryType";
import { useThemeStore } from "../../../stores/useThemeStore";
import BeneficiarySelector from "./BeneficiarySelector";

type Props = {
  mode: "create" | "edit";
  type: BeneficiaryType;
  control: Control<BeneficiaryFormType>;
  individuals: BeneficiaryRspType[];
  isSelf?: boolean;
  disabled?: boolean;
  onAddIndividual: () => void;
};

export default function BeneficiaryFormFields({
  mode,
  type,
  control,
  individuals,
  isSelf = false,
  disabled = false,
  onAddIndividual,
}: Props) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const icons =
    type === "INDIVIDUAL"
      ? ICONS.BENEFICIARY_INDIVIDUAL_ICONS
      : ICONS.BENEFICIARY_GROUP_ICONS;
  return (
    <>
      <View style={styles.headingRow}>
        <View style={styles.iconField}>
          <Controller
            control={control}
            name="icon"
            render={({ field, fieldState: { error } }) => (
              <AppIconSelect
                ref={field.ref}
                value={field.value as AppIconProps["name"]}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={error}
                icons={icons}
                disabled={disabled}
                editable={!disabled}
              />
            )}
          />
        </View>
        <View style={styles.nameField}>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState: { error } }) => (
              <AppTextInput
                ref={field.ref}
                mode="outlined"
                label={type === "GROUP" ? "Label" : "Name"}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                maxLength={BENEFICIARY_NAME_MAX_LEN}
                showClear
                errorField={error}
                disabled={disabled}
              />
            )}
          />
        </View>
      </View>

      <View className="mt-4">
        {type === "INDIVIDUAL" ? (
          <Controller
            control={control}
            name="relationship"
            render={({ field, fieldState: { error } }) => (
              <>
                <AppTextInput
                  ref={field.ref}
                  mode="outlined"
                  label="Relationship"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  maxLength={BENEFICIARY_RELATIONSHIP_MAX_LEN}
                  showClear
                  showCounter={false}
                  errorField={error}
                  disabled={disabled}
                  outlineStyle={styles.relationshipInputOutline}
                />
                <View
                  style={[
                    styles.suggestionCard,
                    {
                      backgroundColor: THEME.surfaceContainerHigh,
                      borderColor: THEME.outline,
                    },
                  ]}
                >
                  <View style={styles.suggestionHeader}>
                    <Text
                      variant="labelSmall"
                      style={{ color: THEME.onSurfaceVariant }}
                    >
                      {t("Suggested relationships")}
                    </Text>
                    <Text
                      variant="labelSmall"
                      style={{ color: THEME.onSurfaceVariant }}
                    >
                      {field.value.length}/{BENEFICIARY_RELATIONSHIP_MAX_LEN}
                    </Text>
                  </View>
                  <ScrollView
                    style={styles.suggestionScroll}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.suggestionContent}
                    keyboardShouldPersistTaps="handled"
                  >
                    {BENEFICIARY_RELATIONSHIP_SUGGESTIONS.map((suggestion) => {
                      const translatedSuggestion = t(suggestion);
                      const isSelected = field.value === translatedSuggestion;

                      return (
                        <Pressable
                          key={suggestion}
                          accessibilityRole="button"
                          accessibilityLabel={t(
                            "Set relationship to {{relationship}}",
                            { relationship: translatedSuggestion },
                          )}
                          accessibilityState={{
                            disabled,
                            selected: isSelected,
                          }}
                          disabled={disabled}
                          onPress={() => field.onChange(translatedSuggestion)}
                          style={[
                            styles.suggestionBadge,
                            {
                              backgroundColor: isSelected
                                ? THEME.primaryContainer
                                : THEME.surfaceContainerHighest,
                              opacity: disabled ? 0.6 : 1,
                            },
                          ]}
                        >
                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={{
                              color: isSelected
                                ? THEME.onPrimaryContainer
                                : THEME.onSurface,
                            }}
                          >
                            {translatedSuggestion}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </>
            )}
          />
        ) : (
          <Controller
            control={control}
            name="memberIds"
            render={({ field, fieldState: { error } }) => (
              <BeneficiarySelector
                label="Members"
                beneficiaries={individuals}
                selectedIds={field.value}
                multiple
                individualsOnly
                optionLayout="grid"
                disabled={disabled}
                errorMessage={error?.message}
                onChange={field.onChange}
                onAdd={onAddIndividual}
              />
            )}
          />
        )}
      </View>

      <Controller
        control={control}
        name="descriptions"
        render={({ field, fieldState: { error } }) => (
          <AppTextInput
            ref={field.ref}
            mode="outlined"
            label="Description"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            maxLength={BENEFICIARY_DESCRIPTION_MAX_LEN}
            multiline
            numberOfLines={3}
            showClear
            errorField={error}
            disabled={disabled}
          />
        )}
      />

      {mode === "edit" ? (
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <AppSwitch
              label="Active"
              description={
                isSelf
                  ? "The self beneficiary must always remain active."
                  : "Inactive beneficiaries remain available in historical records."
              }
              value={isSelf ? true : field.value}
              onValueChange={field.onChange}
              disabled={disabled || isSelf}
            />
          )}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  headingRow: { flexDirection: "row", gap: 12 },
  iconField: { height: 80, width: 80 },
  nameField: { flex: 1, marginTop: 2 },
  relationshipInputOutline: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  suggestionBadge: {
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    maxWidth: 200,
    paddingHorizontal: 12,
  },
  suggestionCard: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderTopWidth: 0,
    borderWidth: 1,
    marginBottom: 16,
    marginTop: -1,
    paddingBottom: 8,
    paddingTop: 6,
  },
  suggestionContent: {
    gap: 8,
    paddingLeft: 8,
    paddingRight: 16,
  },
  suggestionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  suggestionScroll: { display: "flex", flexGrow: 0 },
});
