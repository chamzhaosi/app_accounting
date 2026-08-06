import { router } from "expo-router";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppText from "../../components/AppText";
import AppView from "../../components/AppView";
import { TRANSACTION_MANAGEMENT_CREATE_URL } from "../../constants/urls";

export default function Dashboard() {
  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow justify-center items-center">
      <AppText>{"Dashboard Page"}</AppText>

      <AppFloatingButton
        icon="plus"
        onPress={() => router.push(TRANSACTION_MANAGEMENT_CREATE_URL)}
      />
    </AppView>
  );
}
