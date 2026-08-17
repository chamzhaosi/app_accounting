import { Controller } from "react-hook-form";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDialog from "../../components/AppDialog";
import AppDivider from "../../components/AppDivider";
import AppIcon from "../../components/AppIcon";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppTextInput from "../../components/AppTextInput";
import AppView from "../../components/AppView";
import { DIALOG_COMMON_BTN_PROPS } from "../../constants/size";
import { LABEL_MAX_LEN } from "../../forms/schemas/accout_type.schema";
import useAccountTypeDetail from "../../hook/account_type/useAccountTypeDetail";
import { useThemeStore } from "../../stores/useThemeStore";
import AccTypeIconsList from "./_components/AccTypeIconsList";

export default function AccountTypeDetail() {
  const { THEME } = useThemeStore();
  const {
    control,
    handleSubmit,
    isDeleting,
    isLoading,
    isSaving,
    isSubmitting,
    onDelete,
    onSubmit,
    rspErrorMsg,
    selectedItem,
    setSelectedItem,
    setShowDialog,
    showDialog,
  } = useAccountTypeDetail();

  if (isLoading) {
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView>
        <AppDialog
          title="Delete"
          description="Are you sure you want to delete this account type?
          Accounts associated with this type will not be affected."
          showDialog={showDialog}
          onDismiss={() => setShowDialog(false)}
          actionRender={
            <>
              <AppButton
                {...DIALOG_COMMON_BTN_PROPS}
                onPress={() => setShowDialog(false)}
              >
                No
              </AppButton>
              <AppButton
                {...DIALOG_COMMON_BTN_PROPS}
                variant={ButtonType.ERROR}
                onPress={() => {
                  setShowDialog(false);
                  void onDelete();
                }}
              >
                Yes
              </AppButton>
            </>
          }
        />

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

        <View className="m-4 mt-0 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
          <View className="flex-row items-center justify-center gap-4 mt-4">
            <AppButton
              disabled={isSubmitting}
              loading={isDeleting}
              onPress={() => {
                Keyboard.dismiss();
                setShowDialog(true);
              }}
              variant={ButtonType.ERROR}
              style={{ flex: 1, borderRadius: 8 }}
              {...SUBMIT_BTN_CONTENT_STYLE}
            >
              Delete
            </AppButton>
            <AppButton
              disabled={isSubmitting}
              loading={isSaving}
              onPress={() => {
                Keyboard.dismiss();
                handleSubmit(onSubmit)();
              }}
              variant={ButtonType.SECONDARY}
              style={{ flex: 0.4, borderRadius: 8 }}
              {...SUBMIT_BTN_CONTENT_STYLE}
            >
              Update
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
        />
      </AppView>
    </TouchableWithoutFeedback>
  );
}
