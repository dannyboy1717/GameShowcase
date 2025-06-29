import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { getGames } from "../lib/supabase";

export default function Games() {
  useEffect(() => {
    getGames();
  }, []);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}