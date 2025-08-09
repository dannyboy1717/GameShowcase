import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { supabase } from "../lib/supabase";
import { Game } from "../types/supabase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../nav/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "GamesList">;

export default function GamesListScreen({ navigation }: Props) {
  const [games, setGames] = useState<Game[]>([]);

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
            onPress={() => navigation.navigate("GameDetails", { id: item.id })}
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