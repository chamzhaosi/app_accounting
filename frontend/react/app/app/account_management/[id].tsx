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
        <AppDialog
          title="Delete"
          description="Are you sure you want to delete this account?
                  Transactions associated with this account will not be affected."
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
        <AppScrollView
          className="border-0 p-4 bg-LIGHT-surfaceContainer dark:bg-DARK-surfaceContainer"
          contentContainerStyle={{ justifyContent: "flex-start" }}
        >
          <AccountManagementFormFields
            accountTypeOptions={logic.accountTypeOptions}
            control={logic.control}
            isSubmitting={logic.isSubmitting}
            setFocus={logic.setFocus}
          />
          <BalanceChangeClassification
            difference={logic.balanceDifference}
            kind={logic.balanceChangeKind}
            categoryId={logic.balanceChangeCategoryId}
            categoryOptions={logic.balanceChangeCategoryOptions}
            transactionDate={logic.balanceChangeDate}
            disabled={logic.isSubmitting}
            onKindChange={logic.setBalanceChangeKind}
            onCategoryChange={logic.setBalanceChangeCategoryId}
            onDateChange={logic.setBalanceChangeDate}
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
                logic.setShowDialog(true);
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
