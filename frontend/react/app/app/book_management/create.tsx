import { Keyboard, View } from "react-native";
import AppButton, {
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppView from "../../components/AppView";
import useBookManagementCreate from "../../hook/book_management/useBookManagementCreate";
import BookManagementFormFields from "./_components/BookManagementFormFields";

export default function BookManagementCreate() {
  const logic = useBookManagementCreate();
  return (
    <AppView>
      <View className="p-4">
        <BookManagementFormFields
          control={logic.control}
          disabled={logic.isSaving}
        />
      </View>
      <View className="px-4">
        {logic.responseError ? (
          <AppText type={TextTypEnum.ERROR}>{logic.responseError}</AppText>
        ) : null}
        <AppButton
          {...SUBMIT_BTN_CONTENT_STYLE}
          style={{ borderRadius: 4 }}
          loading={logic.isSaving}
          disabled={logic.isSaving}
          onPress={() => {
            Keyboard.dismiss();
            logic.handleSubmit(logic.onSubmit)();
          }}
        >
          Save
        </AppButton>
      </View>
    </AppView>
  );
}
