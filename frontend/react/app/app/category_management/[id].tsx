import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDialog from "../../components/AppDialog";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppView from "../../components/AppView";
import { DIALOG_COMMON_BTN_PROPS } from "../../constants/size";
import useCategoryManagementDetail from "../../hook/category_management/useCategoryManagementDetail";
import CategoryManagementFormFields from "./_components/CategoryManagementFormFields";

export default function CategoryManagementDetail() {
  const logic = useCategoryManagementDetail();
  if (logic.isLoading)
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView>
        <AppDialog
          title="Delete"
          description="Are you sure you want to delete this category?
                  Transactions associated with this category will not be affected."
          showDialog={logic.showDialog}
          onDismiss={() => logic.setShowDialog(false)}
          actionRender={
            <>
              <AppButton
                {...DIALOG_COMMON_BTN_PROPS}
                onPress={() => logic.setShowDialog(false)}
              >
                No
              </AppButton>
              <AppButton
                {...DIALOG_COMMON_BTN_PROPS}
                variant={ButtonType.ERROR}
                onPress={() => {
                  logic.setShowDialog(false);
                  void logic.onDelete();
                }}
              >
                Yes
              </AppButton>
            </>
          }
        />
        <View className="flex-1 p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer pb-0">
          <CategoryManagementFormFields
            control={logic.control}
            handleSubmit={logic.handleSubmit}
            isSubmitting={logic.isSubmitting}
            onSubmit={logic.onSubmit}
            setFocus={logic.setFocus}
          />
          <View className="mt-0 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer">
            <View className="flex-row items-center justify-center gap-4 mt-4">
              <AppButton
                disabled={logic.isSubmitting}
                loading={logic.isDeleting}
                onPress={() => {
                  Keyboard.dismiss();
                  logic.setShowDialog(true);
                }}
                variant={ButtonType.ERROR}
                style={{ flex: 1, borderRadius: 8 }}
                {...SUBMIT_BTN_CONTENT_STYLE}
              >
                Delete
              </AppButton>
              <AppButton
                disabled={logic.isSubmitting}
                loading={logic.isSaving}
                onPress={() => {
                  Keyboard.dismiss();
                  logic.handleSubmit(logic.onSubmit)();
                }}
                variant={ButtonType.SECONDARY}
                style={{ flex: 0.4, borderRadius: 8 }}
                {...SUBMIT_BTN_CONTENT_STYLE}
              >
                Save
              </AppButton>
            </View>
            {logic.rspErrorMsg && (
              <AppText type={TextTypEnum.ERROR}>{logic.rspErrorMsg}</AppText>
            )}
          </View>
        </View>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
