import { Keyboard, View } from "react-native";
import { Stack } from "expo-router";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppScrollView from "../../components/AppScrollView";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppView from "../../components/AppView";
import useBeneficiaryManagementCreate from "../../hook/beneficiary_management/useBeneficiaryManagementCreate";
import BeneficiaryFormFields from "./_components/BeneficiaryFormFields";
import { useTranslation } from "../../i18n/helper";

export default function BeneficiaryManagementCreate() {
  const logic = useBeneficiaryManagementCreate();
  const { t } = useTranslation();
  return (
    <AppView>
      <Stack.Screen
        options={{
          title: t(
            logic.type === "INDIVIDUAL" ? "Add Individual" : "Add Group",
          ),
        }}
      />
      <AppScrollView
        className="p-4 pt-3"
        contentContainerStyle={{
          justifyContent: "flex-start",
        }}
      >
        <BeneficiaryFormFields
          mode="create"
          type={logic.type}
          control={logic.control}
          individuals={logic.individuals}
          disabled={logic.isSubmitting}
          onAddIndividual={logic.onAddIndividual}
        />
        {logic.responseError ? (
          <AppText type={TextTypEnum.ERROR}>{t(logic.responseError)}</AppText>
        ) : null}
        <View className="flex-row items-center justify-center gap-4 mt-4 mb-8">
          <AppButton
            variant={ButtonType.SECONDARY}
            disabled={logic.isSubmitting}
            loading={logic.isSaving}
            onPress={() => {
              Keyboard.dismiss();
              logic.handleSubmit((value) => logic.onSubmit(value, false))();
            }}
            style={{ flex: 0.4, borderRadius: 4 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save
          </AppButton>
          <AppButton
            disabled={logic.isSubmitting}
            loading={logic.isSavingAndNew}
            onPress={() => {
              Keyboard.dismiss();
              logic.handleSubmit((value) => logic.onSubmit(value, true))();
            }}
            style={{ flex: 1, borderRadius: 4 }}
            {...SUBMIT_BTN_CONTENT_STYLE}
          >
            Save & New
          </AppButton>
        </View>
      </AppScrollView>
    </AppView>
  );
}
