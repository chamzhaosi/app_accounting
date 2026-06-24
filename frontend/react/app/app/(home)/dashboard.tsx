import { useEffect } from "react";
import AppText from "../../components/AppText";
import AppView from "../../components/AppView";
import { getDB } from "../../sql/db/database";
import AppButton from "../../components/AppButton";

export default function Dashboard() {
  const getData = async () => {
    const db = await getDB();
    console.log(await db.getAllAsync("SELECT * FROM account_types"));
  };

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow justify-center items-center">
      <AppText>{"Dashboard Page"}</AppText>
      <AppButton onPress={getData}>Test DB</AppButton>
    </AppView>
  );
}
