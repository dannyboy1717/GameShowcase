import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { supabase } from "../lib/supabase";
import { Game } from "../types/supabase";
import { useRouter } from "expo-router";

export default function GamesTab() {
  const [games, setGames] = useState<Game[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    const { data, error } = await supabase
      .from("Games")
      .select("id, Name, Rating, Status, Developer/Publisher");
    if (!error && data) setGames(data as unknown as Game[]);
  }

  return (
    <View className="flex-1 bg-white p-4">
      <FlatList
        data={games}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="p-4 border-b border-gray-200"
            onPress={() => router.push(`/screens/GameDetailsScreen?id=${item.id}`)}
          >
            <Text className="text-lg font-bold">{item.Name}</Text>
            <Text>{item["Developer/Publisher"]}</Text>
            <Text>Rating: {item.Rating}</Text>
            <Text>Status: {item.Status}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}