import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Divider } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import GameListItem from "../components/ui/GameListItem";
import { getGames } from "../lib/supabase";
import { Game } from "../types/Game";

enum LoadState {
  Loading,
  Error,
}

export default function Games() {
  const [games, setGames] = useState<Game[] | LoadState>(LoadState.Loading);
  const [fetchError, setFetchError] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadGames();
  }, []);

  async function loadGames() {
    const result = await getGames();

    if (result.error) {
      setFetchError("Error fetching games");
      setGames(LoadState.Error);
      return;
    }
    setGames(result.data);
    setFetchError(undefined);
  };

  function renderGames() {
    switch (games) {
      case LoadState.Loading: {
        return (
          <Spinner />
        );
      }
      case LoadState.Error: {
        return (
          <View className="flex-1 justify-center items-center p-5 min-h-[200px]">
            <Text className="mt-2 text-base text-red-500 text-center">
              {fetchError || "An unknown error occurred."}
            </Text>
            <Text
              className="mt-4 text-base text-blue-600 underline"
              onPress={loadGames}
            >
              Tap to retry
            </Text>
          </View>
        );
      }
      default: {
        const gamesList = games as Game[];

        if (gamesList.length === 0) {
          return (
            <View className="flex-1 justify-center items-center p-5 min-h-[200px]">
              <Text className="mt-2 text-base text-gray-600 text-center">
                No games found.
              </Text>
            </View>
          );
        }

        return (
          <VStack space="md" className="w-full">
            {/* NativeWind doesn't have a direct 'min-w-screen' equivalent for ScrollView content
                VStack will naturally take available width within its parent.
                'w-full' ensures it uses 100% of the parent's width. */}
            {gamesList.map((game) => (
              <React.Fragment key={game.id}>
                <GameListItem game={game} />
                <Divider className="my-2" />
              </React.Fragment>
            ))}
          </VStack>
        );
      }
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-white dark:bg-black min-h-screen">
        <ScrollView className="flex-grow py-16 px-4">
          {renderGames()}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}