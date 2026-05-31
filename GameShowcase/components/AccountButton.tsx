import InteractiveGlass from "@/components/ui/InteractiveGlass";
import Ionicons from "@expo/vector-icons/Ionicons";
import { usePathname, useRouter } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCOUNT_PATH = "/account";

export default function AccountButton() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // The account page is its own destination — don't overlay the button there.
  if (pathname === ACCOUNT_PATH) {
    return null;
  }

  return (
    <InteractiveGlass
      onPress={() => router.push(ACCOUNT_PATH)}
      containerStyle={{
        position: "absolute",
        top: insets.top + 8,
        right: 16,
        zIndex: 20,
      }}
      style={{
        minWidth: 44,
        minHeight: 44,
        borderRadius: 999,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="person-circle-outline" size={22} color="#6366f1" />
      </View>
    </InteractiveGlass>
  );
}
