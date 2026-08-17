import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppView from "../../components/AppView";
import useCategoryManagementCreate from "../../hook/category_management/useCategoryManagementCreate";
import CategoryManagementFormFields from "./_components/CategoryManagementFormFields";

export default function CategoryManagementCreate() {
  const logic = useCategoryManagementCreate();
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView className="flex-1 p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer pb-0">
        <CategoryManagementFormFields
          control={logic.control}
          handleSubmit={logic.handleSubmit}
          isSubmitting={logic.isSubmitting}
          onSubmit={(value) => logic.onSubmit(value, false)}
          setFocus={logic.setFocus}
        />
        <View className="mt-0 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
          <View className="flex-row items-center justify-center gap-4 mt-4">
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
              loading={logic.isSavingAndNew}
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
          {logic.rspErrorMsg && (
            <AppText type={TextTypEnum.ERROR}>{logic.rspErrorMsg}</AppText>
          )}
        </View>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
