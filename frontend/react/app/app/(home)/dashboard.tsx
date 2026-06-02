import AppText from "../../components/AppText";
import AppView from "../../components/AppView";

export default function Dashboard() {
  return (
    <AppView>
      <AppView className="bg-LIGHT-BG_SECONDARY dark:bg-DARK-BG_SECONDARY justify-center items-center">
        <AppText>{"Dashboard Page"}</AppText>
      </AppView>
    </AppView>
  );
}
