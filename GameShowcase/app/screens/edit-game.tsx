"use client";

import AccountButton from "@/components/AccountButton";
import PlatformPicker from "@/components/platform-picker";
import RatingPicker from "@/components/rating-picker";
import StatusPicker from "@/components/status-picker";
import GlassButton from "@/components/ui/GlassButton";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
// import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import type { Database } from "../types/database";
import { GamePlatform, GameStatus } from "../types/supabase";
import { platforms } from "./add-game";
import { useGames } from "@/hooks/useGames";

function InputField({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    keyboardType = "default" as const,
}: {
    label: string;
    value: string | null | undefined;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: "default" | "numeric" | "decimal-pad";
}) {
    return (
        <View className="mb-4">
            <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">{label}</Text>
            <TextInput
                className={`bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-800 dark:text-white ${
                    multiline ? "min-h-[100px]" : ""
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
    );
}

export default function EditGameScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { getGameById, updateGame } = useGames();

    const [selectedName, setSelectedName] = useState<string>("");
    const [selectedDeveloper, setSelectedDeveloper] = useState<string | undefined>(undefined);
    const [selectedPlatform, setSelectedPlatform] = useState<GamePlatform>("PC");
    const [selectedStartDate, setSelectedStartDate] = useState<string | undefined>(undefined);
    const [selectedFinishDate, setSelectedFinishDate] = useState<string | undefined>(undefined);
    const [selectedPlaytime, setSelectedPlaytime] = useState<string | undefined>(undefined);
    const [selectedRating, setSelectedRating] = useState<number>(-1);
    const [selectedStatus, setSelectedStatus] = useState<GameStatus>("Plan to Play");
    const [selectedBoughtDate, setSelectedBoughtDate] = useState<string | undefined>(undefined);
    const [selectedCost, setSelectedCost] = useState<string | undefined>(undefined);
    const [selectedComments, setSelectedComments] = useState<string | undefined>(undefined);

    // const bannerRef = useRef<BannerAd>(null);

    const fetchGameDetails = useCallback(async () => {
        try {
            setLoading(true);

            const existingGame = getGameById(Number(id));

            if (!existingGame) {
                throw new Error("Game not found");
            }

            setSelectedName(existingGame.Name ?? "");
            setSelectedDeveloper(existingGame["Developer/Publisher"] ?? undefined);
            setSelectedPlatform(existingGame.Platform ?? "PC");
            setSelectedStartDate(existingGame.Started ?? undefined);
            setSelectedFinishDate(existingGame.Finished ?? undefined);
            setSelectedPlaytime(existingGame.Playtime ?? undefined);
            setSelectedRating(existingGame.Rating ?? -1);
            setSelectedStatus(existingGame.Status ?? "Plan to Play");
            setSelectedBoughtDate(existingGame.Bought ?? undefined);
            setSelectedCost(existingGame.Cost ?? undefined);
            setSelectedComments(existingGame.Comments ?? undefined);
        } catch {
            Alert.alert("Error", "Failed to load game details");
            router.back();
        } finally {
            setLoading(false);
        }
    }, [getGameById, id]);

    useEffect(() => {
        if (id) {
            void fetchGameDetails();
        }
    }, [fetchGameDetails, id]);

    async function saveGame() {
        try {
            setSaving(true);

            if (!id) {
                throw new Error("Tried to update a game that doesn't exist!");
            }

            const updatedGame: Database["public"]["Tables"]["Games"]["Update"] = {
                Name: selectedName.trim() || null,
                "Developer/Publisher": selectedDeveloper?.trim() || null,
                Platform: selectedPlatform || null,
                Started: selectedStartDate?.trim() || null,
                Finished: selectedFinishDate?.trim() || null,
                Playtime: selectedPlaytime?.trim() || null,
                Rating: selectedRating > 0 ? selectedRating : null,
                Status: selectedStatus || null,
                Bought: selectedBoughtDate?.trim() || null,
                Cost: selectedCost?.trim() || null,
                Comments: selectedComments?.trim() || null,
            };

            await updateGame(Number(id), updatedGame);

            Alert.alert("Success", "Game updated successfully!", [{ text: "OK", onPress: () => router.back() }]);
        } catch (err: any) {
            Alert.alert("Error", "Failed to save game: " + err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#6366f1" />
                <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading game details...</Text>
            </View>
        );
    }

    const statuses = ["Plan to Play", "Started", "Finished", "Completed", "Continuous", "Paused", "Dropped"];

    if (!getGameById(Number(id))) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#6366f1" />
                <Text className="text-gray-600 dark:text-gray-400 mt-4">Unable to fetch game details...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView
                className="flex-1 bg-white dark:bg-gray-900"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            >
                <View className="px-6 pt-4 pb-4">
                    <AccountButton topOffset={0} />
                    <GlassButton label="Cancel" onPress={() => router.back()} style={{ alignSelf: "flex-start", marginBottom: 16 }} />

                    <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Edit Game</Text>
                    <Text className="text-gray-600 dark:text-gray-400 mb-6">Update your game information</Text>
                </View>

                <View className="px-6">
                    <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                        <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</Text>

                        <InputField label="Game Name" value={selectedName} onChangeText={setSelectedName} placeholder="Enter game name" />

                        <InputField
                            label="Developer/Publisher"
                            value={selectedDeveloper}
                            onChangeText={setSelectedDeveloper}
                            placeholder="Enter developer or publisher"
                        />

                        <PlatformPicker options={platforms} selected={selectedPlatform} onSelectedChange={setSelectedPlatform} />

                        <StatusPicker statuses={statuses} selected={selectedStatus} onSelectedChange={setSelectedStatus} />
                        <RatingPicker value={selectedRating} onValueChange={setSelectedRating} />
                    </View>

                    <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                        <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Timeline</Text>

                        <InputField label="Started Date" value={selectedStartDate} onChangeText={setSelectedStartDate} placeholder="YYYY-MM-DD" />

                        <InputField label="Finished Date" value={selectedFinishDate} onChangeText={setSelectedFinishDate} placeholder="YYYY-MM-DD" />

                        <InputField label="Playtime" value={selectedPlaytime} onChangeText={setSelectedPlaytime} placeholder="e.g., 25 hours, 3 days" />
                    </View>

                    <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                        <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Purchase Details</Text>

                        <InputField label="Purchase Date" value={selectedBoughtDate} onChangeText={setSelectedBoughtDate} placeholder="YYYY-MM-DD" />

                        <InputField
                            label="Cost"
                            value={selectedCost}
                            onChangeText={setSelectedCost}
                            placeholder="e.g., $59.99, Free"
                            keyboardType="decimal-pad"
                        />
                    </View>

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

                    <TouchableOpacity
                        className={`py-4 rounded-lg items-center ${saving ? "bg-gray-400 dark:bg-gray-600" : "bg-indigo-600 dark:bg-indigo-500"}`}
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
                    {/* <BannerAd unitId={TestIds.BANNER} ref={bannerRef} size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER} /> */}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
