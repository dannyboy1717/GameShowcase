import { Game } from "@/app/types/Game";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@rneui/themed";
import { ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function GameDetails(props: Game) {
    return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-white dark:bg-black min-h-screen">
        <ScrollView className="flex-grow py-16 px-4">
          <VStack space="md" className="min-w-screen">
            <Text className="text-white">{props.Name}</Text>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
    );
}