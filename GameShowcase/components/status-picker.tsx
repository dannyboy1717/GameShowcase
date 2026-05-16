import { GameStatus } from "@/app/types/supabase";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export interface StatusPickerProps {
    onSelectedChange: (status: GameStatus) => void;
    selected: string;
    statuses: string[];
}

export default function StatusPicker(props: StatusPickerProps) {
    const { onSelectedChange, selected, statuses } = props;

    return (
        <View className="mb-4">
            <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                Status
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
            >
                {statuses.map((status) => (
                    <TouchableOpacity
                        key={status}
                        className={`mr-2 px-4 py-2 rounded-full border ${selected === status
                            ? "bg-indigo-600 border-indigo-600"
                            : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                            }`}
                        onPress={() => onSelectedChange(status as GameStatus)}
                    >
                        <Text
                            className={`font-medium ${selected === status
                                ? "text-white"
                                : "text-gray-700 dark:text-gray-300"
                                }`}
                        >
                            {status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
