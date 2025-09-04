import { Game } from "@/app/types/supabase";
import { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export interface RatingPickerProps {
    game: Game;
    onValueChange: (rating: number) => void;
    value: number;
}

export default function RatingPicker({ game, value, onValueChange }: RatingPickerProps) {
    const ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    useEffect(() => {
        onValueChange(game.Rating ?? -1);
    }, [])

    return (
        <View className="mb-4">
            <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">Rating (1-10)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {ratings.map((rating) => (
                    <TouchableOpacity
                        key={rating}
                        className={`mr-2 w-10 h-10 rounded-full border items-center justify-center ${value === rating
                            ? "bg-yellow-400 border-yellow-400"
                            : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                            }`}
                        onPress={() => onValueChange(rating)}
                    >
                        <Text
                            className={`font-medium ${value === rating
                                ? "text-gray-800"
                                : "text-gray-700 dark:text-gray-300"
                                }`}
                        >
                            {rating}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    )
}