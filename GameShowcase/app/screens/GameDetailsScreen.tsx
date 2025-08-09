import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { supabase } from "../lib/supabase";
import { Game } from "../types/supabase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../nav/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "GameDetails">;

export default function GameDetailsScreen({ route }: Props) {
  const { id } = route.params;
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    fetchGame();
  }, []);

  async function fetchGame() {
    const { data, error } = await supabase
      .from("Games")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) setGame(data as Game);
  }

  if (!game) return null;

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {Object.entries(game).map(([key, value]) => (
        <View key={key} className="mb-2">
          <Text className="font-bold">{key}</Text>
          <Text>{value?.toString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}