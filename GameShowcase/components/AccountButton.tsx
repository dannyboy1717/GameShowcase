import GlassSurface from "@/components/ui/GlassSurface";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

type AccountButtonProps = {
  topOffset?: number;
};

export default function AccountButton({ topOffset = 8 }: AccountButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={() => {
        if (pathname !== "/account") {
          router.push("/account");
        }
      }}
      style={{
        position: "absolute",
        top: insets.top + topOffset,
        right: 16,
        zIndex: 20,
      }}
    >
      {({ pressed }) => (
        <GlassSurface
          style={{
            minWidth: 44,
            minHeight: 44,
            borderRadius: 999,
            paddingHorizontal: 12,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.9 : 1,
          }}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="person-circle-outline" size={22} color="#6366f1" />
          </View>
        </GlassSurface>
      )}
    </Pressable>
  );
}
