import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { getGames } from "../lib/supabase";
import { Game } from "../types/Game";
import { VStack } from "@/components/ui/vstack";
import GameListItem from "../components/ui/GameListItem";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
      <SafeAreaView>
        <ScrollView className="flex-grow p-16">
          <VStack space="md">
            {games?.map((game) => (
              <GameListItem game={game} key={game.id} />
            ))}
          </VStack>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>

  );
}