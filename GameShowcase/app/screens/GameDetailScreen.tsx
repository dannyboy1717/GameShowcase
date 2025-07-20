import { Spinner } from "@/components/ui/spinner";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { getSupabase, useGameById } from "../lib/supabase";
import { Game } from "../types/Game";

export enum LoadState {
  LOADING,
  SUCCESS,
  ERROR,
}

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams();
  const gameId = typeof id === 'string' ? parseInt(id, 10) : undefined;
  const { data: game, isLoading, error } = useGameById(gameId!);

  if (!gameId) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Invalid Game ID</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error loading game: {error.message}</Text>
      </View>
    );
  }

  if (!game) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Game not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-white dark:bg-black min-h-screen">
          <Text className="text-2xl font-bold text-center mt-4 text-black dark:text-white">
            {game.Name}
          </Text>
          <Text className="text-lg text-center mt-2 text-gray-700 dark:text-gray-300">
            {game["Developer/Publisher"]}
          </Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
