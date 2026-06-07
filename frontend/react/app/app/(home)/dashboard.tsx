import AppText from "../../components/AppText";
import AppView from "../../components/AppView";

export default function Dashboard() {
  return (
    <AppView>
      <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow justify-center items-center">
        <AppText>{"Dashboard Page"}</AppText>
      </AppView>
    </AppView>
  );
}
