import { Keyboard, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { Stack } from "expo-router";
import AppButton, {
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../components/AppButton";
import AppScrollView from "../../components/AppScrollView";
import AppText, { TextTypEnum } from "../../components/AppText";
import AppView from "../../components/AppView";
import useBeneficiaryManagementDetail from "../../hook/beneficiary_management/useBeneficiaryManagementDetail";
import BeneficiaryFormFields from "./_components/BeneficiaryFormFields";
import { useTranslation } from "../../i18n/helper";

export default function BeneficiaryManagementDetail() {
  const logic = useBeneficiaryManagementDetail();
  const { t } = useTranslation();
  if (logic.isLoading || !logic.beneficiary)
    return (
      <View className="h-full items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  return (
    <AppView>
      <Stack.Screen
        options={{
          title: t(
            logic.beneficiary.type === "INDIVIDUAL"
              ? "Edit Individual"
              : "Edit Group",
          ),
        }}
      />
      <AppScrollView
        className="p-4"
        contentContainerStyle={{
          justifyContent: "flex-start",
        }}
      >
        <BeneficiaryFormFields
          mode="edit"
          type={logic.beneficiary.type}
          control={logic.control}
          individuals={logic.individuals}
          isSelf={logic.beneficiary.is_self}
          disabled={logic.isSaving}
          onAddIndividual={logic.onAddIndividual}
        />
        {logic.responseError ? (
          <AppText type={TextTypEnum.ERROR}>{t(logic.responseError)}</AppText>
        ) : null}
        <AppButton
          disabled={logic.isSaving}
          loading={logic.isSaving}
          onPress={() => {
            Keyboard.dismiss();
            logic.handleSubmit(logic.onSubmit)();
          }}
          style={{ borderRadius: 4, marginBottom: 32, marginTop: 16 }}
          {...SUBMIT_BTN_CONTENT_STYLE}
        >
          Save
        </AppButton>
      </AppScrollView>
    </AppView>
  );
}
