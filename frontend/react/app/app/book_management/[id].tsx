import { Keyboard, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppSwitch from "../../components/AppSwitch";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppView from "../../components/AppView";
import useBookManagementDetail from "../../hook/book_management/useBookManagementDetail";
import BookManagementFormFields from "./_components/BookManagementFormFields";

export default function BookManagementDetail() {
  const logic = useBookManagementDetail();
  if (logic.isLoading)
    return (
      <View className="h-full items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  return (
    <AppView>
      <View className="p-4 pb-0">
        <BookManagementFormFields
          control={logic.control}
          disabled={logic.isSaving}
        />
      </View>
      <View className="px-4">
        <AppSwitch
          label="Active"
          description={
            logic.book?.is_system_default
              ? "The system-default book must remain active."
              : "Inactive books are read-only."
          }
          value={logic.isActive}
          disabled={logic.isSaving || Boolean(logic.book?.is_system_default)}
          onValueChange={logic.setIsActive}
        />
        {logic.responseError ? (
          <AppText type={TextTypEnum.ERROR}>{logic.responseError}</AppText>
        ) : null}
        <View style={{ display: "flex", flexDirection: "row", gap: 8 }}>
          <AppButton
            {...SUBMIT_BTN_CONTENT_STYLE}
            style={{ borderRadius: 4, flex: 1 }}
            variant={ButtonType.WARNING}
            disabled={logic.isSaving}
            onPress={() => void logic.onSelectBook()}
          >
            Use this Book
          </AppButton>
          <AppButton
            {...SUBMIT_BTN_CONTENT_STYLE}
            style={{ borderRadius: 4, flex: 1 }}
            loading={logic.isSaving}
            disabled={logic.isSaving}
            onPress={() => {
              Keyboard.dismiss();
              logic.handleSubmit(logic.onSubmit)();
            }}
          >
            Update
          </AppButton>
        </View>
      </View>
    </AppView>
  );
}
