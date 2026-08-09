import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GlassButton from "@/components/ui/GlassButton";

/**
 * Uses GlassButton rather than @expo/ui's SwiftUI Button. The native Button
 * renders its label via SwiftUI `Label`, which drops the title and shows a bare
 * icon unless the host gets a usable proposed size — and @expo/ui isn't bundled
 * in Expo Go at all. GlassButton lays the text out in React Native while still
 * rendering real liquid glass through expo-glass-effect on iOS 26, falling back
 * to BlurView elsewhere (see components/ui/GlassSurface.tsx).
 */
type AddGameButtonProps = {
    /**
     * Height of anything pinned below the button — currently the banner ad.
     * AdMob treats proximity to interactive elements as a leading cause of
     * accidental clicks, so the button is lifted clear of it rather than
     * floating on top.
     */
    bottomOffset?: number;
};

export default function AddGameButton({ bottomOffset = 0 }: AddGameButtonProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const isDark = useColorScheme() === "dark";

    return (
        <GlassButton
            label="Add Game"
            leading={<Ionicons name="add" size={20} color={isDark ? "#eef2ff" : "#1e1b4b"} />}
            onPress={() => router.push("/screens/search-game")}
            style={{
                position: "absolute",
                right: 16,
                bottom: insets.bottom + 20 + bottomOffset,
                zIndex: 20,
            }}
        />
    );
}
