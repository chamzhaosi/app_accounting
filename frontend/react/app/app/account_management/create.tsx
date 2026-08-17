import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDivider from "../../components/AppDivider";
import AppScrollView from "../../components/AppScrollView";
import AppText, { TextTypEnum } from "../../components/AppText";
import useAccountManagementCreate from "../../hook/account_management/useAccountManagementCreate";
import AccountManagementFormFields from "./_components/AccountManagementFormFields";

export default function AccountManagementCreate() {
  const logic = useAccountManagementCreate();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppScrollView
        className="p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer"
        contentContainerStyle={{ justifyContent: "flex-start" }}
      >
        <AccountManagementFormFields
          accountTypeOptions={logic.accountTypeOptions}
          control={logic.control}
          isSubmitting={logic.isSubmitting}
          setFocus={logic.setFocus}
        />
        <AppDivider />
        {logic.rspErrorMsg && (
          <AppText type={TextTypEnum.ERROR}>{logic.rspErrorMsg}</AppText>
        )}
        <View className="flex-row items-center justify-center gap-4 mt-6">
          <AppButton
            disabled={logic.isSubmitting}
            loading={logic.isSaving}
            variant={ButtonType.SECONDARY}
            onPress={() => {
              Keyboard.dismiss();
              logic.handleSubmit((value) => logic.onSubmit(value, false))();
            }}
            style={{ flex: 0.4, borderRadius: 8 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save
          </AppButton>
          <AppButton
            disabled={logic.isSubmitting}
            loading={logic.isSavingAndNewAcc}
            onPress={() => {
              !logic.errors.label && Keyboard.dismiss();
              logic.handleSubmit((value) => logic.onSubmit(value, true))();
            }}
            style={{ flex: 1, borderRadius: 8 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save & New
          </AppButton>
        </View>
      </AppScrollView>
    </TouchableWithoutFeedback>
  );
}
