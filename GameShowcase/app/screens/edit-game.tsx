"use client"

import RatingPicker from "@/components/rating-picker"
import StatusPicker from "@/components/status-picker"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native"
import { supabase } from "../lib/supabase"
import { Game, GamePlatform, GameStatus } from "../types/supabase"

export default function EditGameScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [game, setGame] = useState<Game | undefined>(undefined);

    const [selectedName, setSelectedName] = useState<string>(game?.Name ?? "");
    const [selectedDeveloper, setSelectedDeveloper] = useState<string | undefined>(game?.["Developer/Publisher"] ?? undefined);
    const [selectedPlatform, setSelectedPlatform] = useState<GamePlatform>(game?.Platform || "PC");
    const [selectedStartDate, setSelectedStartDate] = useState<string | undefined>(game?.Started ?? undefined);
    const [selectedFinishDate, setSelectedFinishDate] = useState<string | undefined>(game?.Finished ?? undefined);
    const [selectedPlaytime, setSelectedPlaytime] = useState<string | undefined>(game?.Playtime ?? undefined);
    const [selectedRating, setSelectedRating] = useState<number>(game?.Rating ?? -1);
    const [selectedStatus, setSelectedStatus] = useState<GameStatus>(game?.Status ?? "Plan to Play");
    const [selectedBoughtDate, setSelectedBoughtDate] = useState<string | undefined>(game?.Bought ?? undefined);
    const [selectedCost, setSelectedCost] = useState<string | undefined>(game?.Cost ?? undefined);
    const [selectedComments, setSelectedComments] = useState<string | undefined>(game?.Comments ?? undefined);

    async function fetchGameDetails() {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("Games").select("*").eq("id", id).single();

            if (error) throw error;

            setGame(data);
            setSelectedName(data.Name ?? "");
            setSelectedDeveloper(data["Developer/Publisher"] ?? undefined);
            setSelectedPlatform(data.Platform ?? "PC");
            setSelectedStartDate(data.Started ?? undefined);
            setSelectedFinishDate(data.Finished ?? undefined);
            setSelectedPlaytime(data.Playtime ?? undefined);
            setSelectedRating(data.Rating ?? -1);
            setSelectedStatus(data.Status ?? "Plan to Play");
            setSelectedBoughtDate(data.Bought ?? undefined);
            setSelectedCost(data.Cost ?? undefined);
            setSelectedComments(data.Comments ?? undefined);
        } catch {
            Alert.alert("Error", "Failed to load game details");
            router.back();
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (id) {
            void fetchGameDetails();
        }
    }, [])

    async function saveGame() {
        try {
            setSaving(true);

            if (!game) {
                throw new Error("Tried to update a game that doesn't exist!");
            }

            game.Name = selectedName;
            game.Platform = selectedPlatform;
            game.Rating = selectedRating;
            game.Status = selectedStatus;
            if (selectedPlaytime) game.Playtime = selectedPlaytime;
            if (selectedBoughtDate) game.Bought = selectedBoughtDate;
            if (selectedComments) game.Comments = selectedComments;
            if (selectedCost) game.Cost = selectedCost;
            if (selectedDeveloper) game["Developer/Publisher"] = selectedDeveloper;
            if (selectedFinishDate) game.Finished = selectedFinishDate;
            if (selectedStartDate) game.Started = selectedStartDate;

            console.log("updated game:", game);

            const { status, statusText, error } = await supabase
                .from("Games")
                .upsert(game)
                .eq("id", game.id);

            if (error) throw error;

            console.log(status);
            console.log(statusText);

            Alert.alert("Success", "Game updated successfully!", [
                { text: "OK", onPress: () => router.back() }
            ])
        } catch (err: any) {
            Alert.alert("Error", "Failed to save game: " + err.message);
        } finally {
            setSaving(false);
        }
    }

    function setGameRating(rating: number) {
        if (!game) return;
        game.Rating = rating;
        setGame(game);
    }

    function setGameStatus(status: GameStatus) {
        if (!game) return;
        game.Status = status;
        setGame(game);
    }

    const InputField = ({
        label,
        value,
        onChangeText,
        placeholder,
        multiline = false,
        keyboardType = "default" as any
    }: {
        label: string
        value: string | null | undefined
        onChangeText: (text: string) => void
        placeholder: string
        multiline?: boolean
        keyboardType?: "default" | "numeric" | "decimal-pad"
    }) => (
        <View className="mb-4">
            <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">{label}</Text>
            <TextInput
                className={`bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-800 dark:text-white ${multiline ? "min-h-[100px]" : ""
                    }`}
                value={value || ""}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                multiline={multiline}
                textAlignVertical={multiline ? "top" : "center"}
                keyboardType={keyboardType}
            />
        </View>
    )

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#6366f1" />
                <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading game details...</Text>
            </View>
        )
    }

    const statuses = [
        "Plan to Play",
        "Playing",
        "Started",
        "Completed",
        "Finished",
        "Paused",
        "Dropped",
    ];

    if (!game) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#6366f1" />
                <Text className="text-gray-600 dark:text-gray-400 mt-4">
                    Unable to fetch game details...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white dark:bg-gray-900" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="px-6 pt-6 pb-4">
                <TouchableOpacity className="self-start mb-4 p-2 -ml-2" onPress={() => router.back()}>
                    <Text className="text-indigo-600 dark:text-indigo-400 text-base font-medium">← Cancel</Text>
                </TouchableOpacity>

                <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Edit Game
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 mb-6">
                    Update your game information
                </Text>
            </View>

            {/* Form */}
            <View className="px-6">
                {/* Basic Information */}
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                    <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</Text>

                    <InputField
                        label="Game Name"
                        value={selectedName}
                        onChangeText={setSelectedName}
                        placeholder="Enter game name"
                    />

                    <InputField
                        label="Developer/Publisher"
                        value={selectedDeveloper}
                        onChangeText={setSelectedDeveloper}
                        placeholder="Enter developer or publisher"
                    />

                    <InputField
                        label="Platform"
                        value={selectedPlatform}
                        onChangeText={(text) => setSelectedPlatform(text as GamePlatform)}
                        placeholder="e.g., PC, PlayStation, Xbox, Switch"
                    />

                    <StatusPicker statuses={statuses} selected={selectedStatus} onSelectedChange={setSelectedStatus} game={game} />
                    <RatingPicker game={game} value={selectedRating} onValueChange={setSelectedRating} />
                </View>

                {/* Timeline */}
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                    <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Timeline</Text>

                    <InputField
                        label="Started Date"
                        value={selectedStartDate}
                        onChangeText={setSelectedStartDate}
                        placeholder="YYYY-MM-DD"
                    />

                    <InputField
                        label="Finished Date"
                        value={selectedFinishDate}
                        onChangeText={setSelectedFinishDate}
                        placeholder="YYYY-MM-DD"
                    />

                    <InputField
                        label="Playtime"
                        value={selectedPlaytime}
                        onChangeText={setSelectedPlaytime}
                        placeholder="e.g., 25 hours, 3 days"
                    />
                </View>

                {/* Purchase Information */}
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                    <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Purchase Details</Text>

                    <InputField
                        label="Purchase Date"
                        value={selectedBoughtDate}
                        onChangeText={setSelectedBoughtDate}
                        placeholder="YYYY-MM-DD"
                    />

                    <InputField
                        label="Cost"
                        value={selectedCost}
                        onChangeText={setSelectedCost}
                        placeholder="e.g., $59.99, Free"
                        keyboardType="decimal-pad"
                    />
                </View>

                {/* Comments */}
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                    <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Comments</Text>

                    <InputField
                        label="Notes & Comments"
                        value={selectedComments}
                        onChangeText={setSelectedComments}
                        placeholder="Add your thoughts, notes, or review..."
                        multiline
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    className={`py-4 rounded-lg items-center mb-8 ${saving
                        ? "bg-gray-400 dark:bg-gray-600"
                        : "bg-indigo-600 dark:bg-indigo-500"
                        }`}
                    onPress={saveGame}
                    disabled={saving}
                >
                    {saving ? (
                        <View className="flex-row items-center">
                            <ActivityIndicator size="small" color="white" />
                            <Text className="text-white font-semibold ml-2">Saving...</Text>
                        </View>
                    ) : (
                        <Text className="text-white font-semibold">Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}