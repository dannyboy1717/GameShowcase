"use client"

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, FlatList, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Game } from "../types/supabase";

import { SafeAreaView } from "react-native-safe-area-context";

export default function GamesTab() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    setLoading(true);
    setError(undefined);

    const { data, error } = await supabase
      .from("Games")
      .select("*");

    setLoading(false);

    if (!error && data) {
      setGames(data as unknown as Game[]);
      console.log("Set games!")
    } else {
      setError(error?.message || "Failed to load games.");
      console.log("error, ", error);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "started":
        return "▶";
      case "finished":
        return "✓";
      case "completed":
        return "100%";
      case "continuous":
        return "..."
      case "dropped":
        return "✕";
      case "paused":
        return "⏸";
      case "plan to play":
        return "♡";
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "started":
        return "text-blue-500";
      case "finished":
        return "text-green-500";
      case "completed":
        return "text-violet-500";
      case "continuous":
        return "text-black dark:text-white"
      case "dropped":
        return "text-red-500";
      case "paused":
        return "text-slate-500";
      case "plan to play":
        return "text-indigo-500";
    }
  }

  const renderGameItem = ({ item }: { item: Game }) => (
    <TouchableOpacity
      className="bg-white dark:bg-gray-900 mx-4 mb-3 rounded-lg shadow-sm border border-indigo-300 p-4 active:bg-gray-50"
      onPress={() => router.push(`/screens/game-details?id=${item.id}`)}
    >
      <View className="flex-row items-center justify-between">
        {/* Left Content */}
        <View className="flex-1 mr-4">
          <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
            {item.Name}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2" numberOfLines={1}>
            {item["Developer/Publisher"]}
          </Text>

          {/* Rating */}
          {item.Rating && (
            <View className="flex-row items-center">
              <View className="bg-yellow-100 px-2 py-1 rounded-md mr-2">
                <Text className="text-xs font-medium text-yellow-800">★ {item.Rating}</Text>
              </View>
            </View>
          )}

        </View>

        {/* Right Content - Status */}
        <View className="items-center">
          <Text className={`text-xl mb-1 ${getStatusColor(item.Status ?? "Unknown")}`}>{getStatusIcon(item.Status ?? "Unknown")}</Text>
          <Text className={`text-xs font-medium capitalize ${getStatusColor(item.Status ?? "Unknown")}`}>{item.Status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (error) {
    return (
      <View className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <View className="flex flex-col items-center justify-center min-h-screen px-6">
          <Text className="text-xl font-semibold text-black dark:text-white mb-2">
            Oops! Something went wrong
          </Text>
          <Text className="text-muted-foreground text-center mb-6">{error}</Text>
          <Button
            title="Try Again"
            onPress={fetchGames}
          />
        </View>
      </View>
    );
  }

  if (!loading && games.length === 0) {
    return (
      <View className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <View className="flex flex-col items-center justify-center min-h-screen px-6">
          <View className="text-6xl mb-4">🎮</View>
          <Text className="text-xl font-semibold text-foreground mb-2">
            No games available
          </Text>
          <Text className="text-black dark:text-white text-center mb-6">
            Your game library is empty. Start building your collection!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <FlatList
          data={games}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGameItem}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
    </SafeAreaView>
  )
}