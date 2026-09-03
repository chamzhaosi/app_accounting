import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppDialog from "../../components/AppDialog";
import AppDivider from "../../components/AppDivider";
import AppScrollView from "../../components/AppScrollView";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppView from "../../components/AppView";
import { DIALOG_COMMON_BTN_PROPS } from "../../constants/size";
import useAccountManagementDetail from "../../hook/account_management/useAccountManagementDetail";
import AccountManagementFormFields from "./_components/AccountManagementFormFields";
import BalanceChangeClassification from "./_components/BalanceChangeClassification";
import TransactionAttachmentButton from "../transaction_management/_components/TransactionAttachmentButton";
import TransactionAttachmentManager from "../transaction_management/_components/TransactionAttachmentManager";
import TransactionAttachmentPreview from "../transaction_management/_components/TransactionAttachmentPreview";

export default function AccountManagementDetail() {
  const logic = useAccountManagementDetail();
  if (logic.isLoading) {
    return (
      <View className="h-full justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <AppView
        isSafe
        edges={["bottom", "left", "left"]}
        className="bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer"
      >
        <TransactionAttachmentButton
          count={logic.attachmentState.attachmentCount}
          visible={
            logic.balanceDifference === 0 &&
            logic.attachmentState.attachmentCount > 0
          }
          disabled={
            logic.isSubmitting || logic.attachmentState.isLoadingAttachments
          }
          onPress={logic.attachmentState.onAttachmentPress}
        />
        <TransactionAttachmentManager
          attachments={logic.attachmentState.attachments}
          isManagerVisible={logic.attachmentState.isManagerVisible}
          isProcessing={logic.attachmentState.isProcessingAttachment}
          isSourceMenuVisible={logic.attachmentState.isSourceMenuVisible}
          maxAttachments={logic.attachmentState.maxAttachments}
          onAdd={logic.attachmentState.onAddPress}
          onChooseGallery={logic.attachmentState.onChooseGallery}
          onCloseManager={logic.attachmentState.onCloseManager}
          onCloseSourceMenu={logic.attachmentState.onCloseSourceMenu}
          onPreview={logic.attachmentState.onPreviewAttachment}
          onRemove={(attachment) =>
            void logic.attachmentState.removeAttachment(attachment)
          }
          onTakePhoto={logic.attachmentState.onTakePhoto}
        />
        <TransactionAttachmentPreview
          attachment={logic.attachmentState.previewAttachment}
          onDismiss={() => logic.attachmentState.onPreviewAttachment(undefined)}
          onRemove={(attachment) =>
            void logic.attachmentState.removeAttachment(attachment)
          }
        />
        <AppDialog
          title="Discard attachment changes?"
          description="Your unsaved attachment changes will be lost."
          showDialog={logic.attachmentState.showDiscardDialog}
          onDismiss={logic.attachmentState.cancelDiscard}
          actionRender={
            <>
              <AppButton
                {...DIALOG_COMMON_BTN_PROPS}
                variant={ButtonType.SECONDARY}
                onPress={logic.attachmentState.cancelDiscard}
              >
                Keep editing
              </AppButton>
              <AppButton
                {...DIALOG_COMMON_BTN_PROPS}
                variant={ButtonType.ERROR}
                onPress={() => void logic.attachmentState.discardChanges()}
              >
                Discard
              </AppButton>
            </>
          }
        />
        <AppDialog
          title="Delete"
          description="Are you sure you want to delete this account?
                  Transactions associated with this account will not be affected."
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
          title="Deactivate account?"
          description="This account will not be available for new transactions. Existing transactions and the account balance will not be affected."
          showDialog={logic.showDeactivateDialog}
          onDismiss={() => logic.setShowDeactivateDialog(false)}
          actionRender={
            <>
              <AppButton
                {...DIALOG_COMMON_BTN_PROPS}
                variant={ButtonType.SECONDARY}
                onPress={() => logic.setShowDeactivateDialog(false)}
              >
                Cancel
              </AppButton>
              <AppButton
                {...DIALOG_COMMON_BTN_PROPS}
                onPress={() => void logic.confirmDeactivate()}
              >
                Deactivate
              </AppButton>
            </>
          }
        />
        <AppScrollView
          enableOnAndroid
          className="border-0 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer"
          contentContainerStyle={{
            justifyContent: "flex-start",
            padding: 16,
            paddingBottom: 32,
          }}
        >
          <AccountManagementFormFields
            accountTypeOptions={logic.accountTypeOptions}
            creditCardTypeId={logic.creditCardTypeId}
            currencyOptions={logic.currencyOptions}
            control={logic.control}
            isSubmitting={logic.isSubmitting}
            setFocus={logic.setFocus}
            setValue={logic.setValue}
            showCurrencyField={logic.showCurrencyField}
          />
          <BalanceChangeClassification
            difference={logic.balanceDifference}
            kind={logic.balanceChangeKind}
            categoryId={logic.balanceChangeCategoryId}
            categoryOptions={logic.balanceChangeCategoryOptions}
            description={logic.balanceChangeDescription}
            recentDescriptions={logic.recentBalanceChangeDescriptions}
            attachmentCount={logic.attachmentState.attachmentCount}
            attachmentDisabled={
              logic.isSubmitting || logic.attachmentState.isLoadingAttachments
            }
            transactionDate={logic.balanceChangeDate}
            disabled={logic.isSubmitting}
            onKindChange={logic.setBalanceChangeKind}
            onCategoryChange={logic.setBalanceChangeCategoryId}
            onDateChange={logic.setBalanceChangeDate}
            onDescriptionChange={logic.setBalanceChangeDescription}
            onAttachmentPress={logic.attachmentState.onAttachmentPress}
          />
          <AppDivider />
          {logic.rspErrorMsg && (
            <AppText type={TextTypEnum.ERROR}>{logic.rspErrorMsg}</AppText>
          )}
          <View className="flex-row items-center justify-center gap-4 mt-6">
            <AppButton
              disabled={logic.isSubmitting}
              loading={logic.isDeleting}
              onPress={() => {
                Keyboard.dismiss();
                logic.setShowDeleteDialog(true);
              }}
              variant={ButtonType.ERROR}
              style={{ flex: 1, borderRadius: 8 }}
              {...SUBMIT_BTN_CONTENT_STYLE}
            >
              Delete
            </AppButton>
            <AppButton
              disabled={logic.isSubmitting || !logic.isBalanceChangeReady}
              loading={logic.isSaving}
              onPress={() => {
                Keyboard.dismiss();
                logic.handleSubmit(logic.onSubmit)();
              }}
              variant={ButtonType.PRIMARY}
              style={{ flex: 0.4, borderRadius: 8 }}
              {...SUBMIT_BTN_CONTENT_STYLE}
            >
              Save
            </AppButton>
          </View>
        </AppScrollView>
      </AppView>
    </TouchableWithoutFeedback>
  );
}
