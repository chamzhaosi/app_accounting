import { router } from "expo-router";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppText from "../../components/AppText";
import AppView from "../../components/AppView";
import { TRANSACTION_MANAGEMENT_CREATE_URL } from "../../constants/urls";
import TransactionManagementList from "../transaction_management/list";

export default function Dashboard() {
  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow justify-center items-center">
      {/* <AppText>{"Dashboard Page"}</AppText> */}

      <TransactionManagementList />

      <AppFloatingButton
        icon="plus"
        onPress={() => router.push(TRANSACTION_MANAGEMENT_CREATE_URL)}
      />
    </AppView>
  );
}
