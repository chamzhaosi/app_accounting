import { Keyboard, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDialog from "../../components/AppDialog";
import { DIALOG_COMMON_BTN_PROPS } from "../../constants/size";
import useTransactionManagementDetail from "../../hook/transaction_management/useTransactionManagementDetail";
import { TransactionFormScreen } from "./create";

export default function TransactionManagementDetail() {
  const logic = useTransactionManagementDetail();

  if (logic.isLoadingTransaction) {
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex flex-1">
      <AppDialog
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction and all linked fees and attachments?"
        showDialog={logic.showDeleteDialog}
        onDismiss={() => logic.setShowDeleteDialog(false)}
        actionRender={
          <>
            <AppButton
              {...DIALOG_COMMON_BTN_PROPS}
              onPress={() => logic.setShowDeleteDialog(false)}
            >
              No
            </AppButton>
            <AppButton
              {...DIALOG_COMMON_BTN_PROPS}
              variant={ButtonType.ERROR}
              onPress={() => {
                logic.setShowDeleteDialog(false);
                void logic.onDelete();
              }}
            >
              Yes
            </AppButton>
          </>
        }
      />
      <AppDialog
        title="Minimum payment"
        description="Does this payment satisfy the minimum payment required for this credit-card statement?"
        showDialog={logic.showMinimumPaymentDialog}
        onDismiss={logic.cancelMinimumPaymentPrompt}
        actionRender={
          <>
            <AppButton
              {...DIALOG_COMMON_BTN_PROPS}
              variant={ButtonType.SECONDARY}
              onPress={logic.cancelMinimumPaymentPrompt}
            >
              Cancel
            </AppButton>
            <AppButton
              {...DIALOG_COMMON_BTN_PROPS}
              variant={ButtonType.SECONDARY}
              onPress={() => void logic.finishMinimumPaymentPrompt(false)}
            >
              No
            </AppButton>
            <AppButton
              {...DIALOG_COMMON_BTN_PROPS}
              onPress={() => void logic.finishMinimumPaymentPrompt(true)}
            >
              Yes
            </AppButton>
          </>
        }
      />

      <TransactionFormScreen
        logic={logic}
        lockTransactionType
        footer={
          <View className="flex-row items-center justify-center gap-4 mt-2 mb-4">
            <AppButton
              disabled={logic.isSubmitting}
              loading={logic.isDeleting}
              variant={ButtonType.ERROR}
              onPress={() => {
                Keyboard.dismiss();
                logic.setShowDeleteDialog(true);
              }}
              style={{ flex: 1, borderRadius: 8 }}
              {...SUBMIT_BTN_CONTENT_STYLE}
            >
              Delete
            </AppButton>
            <AppButton
              disabled={logic.isSubmitting}
              loading={logic.isSaving}
              onPress={logic.handleSubmit(logic.onSubmit)}
              style={{ flex: 0.4, borderRadius: 8 }}
              {...SUBMIT_BTN_CONTENT_STYLE}
            >
              Save
            </AppButton>
          </View>
        }
      />
    </View>
  );
}
