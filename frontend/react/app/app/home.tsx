import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Home() {
  return (
    <View>
      <Text className="text-xl font-bold text-blue-500">Home Page</Text>
      <Link href={"/login"}>Login</Link>
    </View>
  );
}
