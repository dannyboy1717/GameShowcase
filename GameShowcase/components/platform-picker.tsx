import { GamePlatform } from "@/app/types/supabase";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type PlatformPickerProps = {
  options: GamePlatform[];
  selected: GamePlatform;
  onSelectedChange: (platform: GamePlatform) => void;
};

export default function PlatformPicker({ options, selected, onSelectedChange }: PlatformPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">Platform</Text>
      <Pressable
        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3"
        onPress={() => setOpen((current) => !current)}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-800 dark:text-white">{selected}</Text>
          <Text className="text-indigo-600 dark:text-indigo-400 font-semibold">{open ? "▲" : "▼"}</Text>
        </View>
      </Pressable>

      {open ? (
        <View className="mt-2 rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 overflow-hidden">
          <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
            {options.map((platform) => (
              <Pressable
                key={platform}
                className={`px-4 py-3 border-b border-gray-100 dark:border-gray-600 ${
                  selected === platform ? "bg-indigo-50 dark:bg-indigo-500/20" : ""
                }`}
                onPress={() => {
                  onSelectedChange(platform);
                  setOpen(false);
                }}
              >
                <Text
                  className={`font-medium ${
                    selected === platform
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-gray-800 dark:text-white"
                  }`}
                >
                  {platform}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
