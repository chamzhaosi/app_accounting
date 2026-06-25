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

  const addData = async () => {
    const db = await getDB();
    await db.execAsync(`
    INSERT INTO account_types (name) VALUES ('New Test');
  `);
  };

  return (
    <AppView className="bg-LIGHT-surfaceContainerLow dark:bg-DARK-surfaceContainerLow justify-center items-center">
      <AppText>{"Dashboard Page"}</AppText>
      <AppButton onPress={getData}>Read DB</AppButton>
      <AppButton onPress={addData}>Add DB</AppButton>
    </AppView>
  );
}
