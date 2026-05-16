import GlassSurface from "@/components/ui/GlassSurface";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddGameButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={() => router.push("/screens/add-game")}
      style={{
        position: "absolute",
        right: 16,
        bottom: insets.bottom + 20,
        zIndex: 20,
      }}
    >
      {({ pressed }) => (
        <GlassSurface
          style={{
            minHeight: 52,
            borderRadius: 999,
            paddingHorizontal: 18,
            opacity: pressed ? 0.92 : 1,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52 }}>
            <Ionicons name="add" size={22} color="#6366f1" />
            <Text style={{ color: "#6366f1", fontWeight: "700", fontSize: 15 }}>Add Game</Text>
          </View>
        </GlassSurface>
      )}
    </Pressable>
  );
}
