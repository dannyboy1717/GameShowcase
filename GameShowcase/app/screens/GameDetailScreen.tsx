import { Spinner } from "@/components/ui/spinner";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { getSupabase } from "../lib/supabase";
import { Game } from "../types/Game";

export enum LoadState {
  LOADING,
  SUCCESS,
  ERROR,
}

export default function GameDetailScreen() {
  const [game, setGame] = useState<Game | LoadState>(LoadState.LOADING);
  const { id } = useLocalSearchParams();

  useEffect(() => {
    getGameDetails(id as string);
  }, [id])

  async function getGameDetails(id: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("Games")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching game details:", error);
      setGame(LoadState.ERROR);
    }
    if (!data || data === null) {
      console.warn("No game found with id:", id);
      setGame(LoadState.ERROR);
    }
    console.log("Setting game");
    setGame(data);
  }

  function renderGame() {
    switch (game) {
      case LoadState.LOADING:
        return <Spinner size="large" />;
      case LoadState.ERROR:
        return (
          <Text className="text-red-500 text-center">
            Error loading game details.
          </Text>
        );
      default: {
        const newGame = game as Game;
        return (
          <>
            <Text className="text-2xl font-bold text-center mt-4 text-black dark:text-white">
              {newGame.Name}
            </Text>
            <Text className="text-lg text-center mt-2 text-gray-700 dark:text-gray-300">
              {newGame["Developer/Publisher"]}
            </Text>
          </>
        );
      }
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-white dark:bg-black min-h-screen">
        {renderGame()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
