import { Controller } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDivider from "../../components/AppDivider";
import AppIcon from "../../components/AppIcon";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import { LABEL_MAX_LEN } from "../../forms/schemas/accout_type.schema";
import useAccountTypeCreate from "../../hook/account_type/useAccountTypeCreate";
import { useThemeStore } from "../../stores/useThemeStore";
import AccTypeIconsList from "./_components/AccTypeIconsList";

export default function AccountTypeCreate() {
  const { THEME } = useThemeStore();
  const {
    control,
    errors,
    handleSubmit,
    isSaving,
    isSavingAndNewType,
    isSubmitting,
    onSubmit,
    rspErrorMsg,
    selectedItem,
    setSelectedItem,
  } = useAccountTypeCreate();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView>
        <View className="flex-row justify-around px-4 pt-2 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
          <View className="items-center justify-center p-4 rounded-lg mr-4 mt-2 bg-LIGHT-tertiary dark:bg-DARK-tertiary">
            <AppIcon name={selectedItem} size={48} color={THEME.onTertiary} />
          </View>
          <View className="flex-1 justify-center">
            <Controller
              control={control}
              name="label"
              render={({
                field: { value, onChange, onBlur, ref },
                fieldState: { error },
              }) => (
                <AppTextInput
                  ref={ref}
                  mode="outlined"
                  label="Label"
                  autoFocus
                  editable={!isSubmitting}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  maxLength={LABEL_MAX_LEN}
                  showClear
                  errorField={error}
                />
              )}
            />
          </View>
        </View>

        <View className="p-4 pt-0 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
          <View className="flex-row items-center justify-center gap-4 mt-4">
            <AppButton
              disabled={isSubmitting}
              loading={isSaving}
              variant={ButtonType.SECONDARY}
              onPress={() => {
                Keyboard.dismiss();
                handleSubmit((value) => onSubmit(value, false))();
              }}
              style={{ flex: 0.4, borderRadius: 8 }}
              {...SUBMIT_BTN_CONTENT_STYLE}
            >
              Save
            </AppButton>
            <AppButton
              disabled={isSubmitting}
              loading={isSavingAndNewType}
              onPress={() => {
                !errors.label && Keyboard.dismiss();
                handleSubmit((value) => onSubmit(value, true))();
              }}
              style={{ flex: 1, borderRadius: 8 }}
              {...SUBMIT_BTN_CONTENT_STYLE}
            >
              Save & New
            </AppButton>
          </View>
          {rspErrorMsg && (
            <AppText type={TextTypEnum.ERROR}>{rspErrorMsg}</AppText>
          )}
        </View>

        <AppDivider />
        <AccTypeIconsList
          setSelectedItem={setSelectedItem}
          selectedItem={selectedItem}
          disabled={isSubmitting}
        />
      </AppView>
    </TouchableWithoutFeedback>
  );
}
