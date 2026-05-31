import { Button, Host } from "@expo/ui/swift-ui";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddGameButton() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <Host
            matchContents
            style={{
                position: "absolute",
                right: 16,
                bottom: insets.bottom + 20,
                zIndex: 20,
            }}
        >
            <Button variant="glassProminent" systemImage="plus" controlSize="large" color="#6366f1" onPress={() => router.push("/screens/add-game")} />
        </Host>
    );
}
