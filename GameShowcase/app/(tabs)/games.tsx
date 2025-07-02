import { VStack } from "@/components/ui/vstack";
import { Divider } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import GameListItem from "../components/ui/GameListItem";
import { getGames } from "../lib/supabase";
import { Game } from "../types/Game";

export default function Games() {
  const [games, setGames] = useState<Game[] | undefined>(undefined);
  useEffect(() => {
    const fetchGames = async () => {
      setGames(await getGames());
    };
    fetchGames();
  }, []);
  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-white dark:bg-black">
        <ScrollView className="flex-grow py-16 px-4">
          <VStack space="md" className="min-w-screen">
            {games?.map((game) => (
              <><GameListItem game={game} key={game.id} /><Divider key={`divider-${game.id}`} className="my-2" /></>
            ))}
          </VStack>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}