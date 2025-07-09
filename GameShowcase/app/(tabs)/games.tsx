import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Divider } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import GameListItem from "../components/ui/GameListItem";
import { getGames } from "../lib/supabase";
import { LoadState } from "../screens/GameDetailScreen";
import { Game } from "../types/Game";

function renderGames(games: Game[] | LoadState) {
  switch (games) {
    case LoadState.LOADING:
      return <Spinner size="large" />;
    case LoadState.ERROR:
      return (
        <Text className="text-red-500 text-center">Error loading games.</Text>
      );
    default: {
      const gameArray = games as Game[];
      return (
        <>
          {gameArray?.map((game) => (
            <React.Fragment key={game.id}>
              <GameListItem game={game} />
              <Divider key={`divider-${game.id}`} className="my-2" />
            </React.Fragment>
          ))}
        </>
      );
    }
  }
}

export default function Games() {
  const [games, setGames] = useState<Game[] | LoadState>(LoadState.LOADING);
  useEffect(() => {
    const fetchGames = async () => {
      const result = await getGames();
      if (result.error || !result.data) {
        setGames(LoadState.ERROR);
      } else {
        setGames(result.data);
      }
    };
    fetchGames();
  }, []);

  // TODO: persist games list
  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-white dark:bg-black min-h-screen">
        <ScrollView className="flex-grow py-16 px-4">
          <VStack space="md" className="min-w-screen">
            {renderGames(games)}
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
