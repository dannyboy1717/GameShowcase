import InteractiveGlass from "@/components/ui/InteractiveGlass";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddGameButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <InteractiveGlass
      onPress={() => router.push("/screens/add-game")}
      containerStyle={{
        position: "absolute",
        right: 16,
        bottom: insets.bottom + 20,
        zIndex: 20,
      }}
      style={{
        minHeight: 52,
        borderRadius: 999,
        paddingHorizontal: 18,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52 }}>
        <Ionicons name="add" size={22} color="#6366f1" />
        <Text style={{ color: "#6366f1", fontWeight: "700", fontSize: 15 }}>Add Game</Text>
      </View>
    </InteractiveGlass>
  );
}
