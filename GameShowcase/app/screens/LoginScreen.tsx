import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { supabase } from "../lib/supabase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../nav/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) navigation.navigate("Profile");
  }

  return (
    <View className="flex-1 justify-center p-4 bg-white">
      <Text className="text-xl font-bold mb-4">Login</Text>
      <TextInput
        className="border p-2 mb-2"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="border p-2 mb-4"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign In" onPress={signIn} />
    </View>
  );
}