"use client";

import AddGameButton from "@/components/AddGameButton";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Button, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Host, Picker } from "@expo/ui/swift-ui";
import { supabase } from "../lib/supabase";
import { Game, GameStatus } from "../types/supabase";

type SortOption = "dateAdded" | "alphabetical" | "dateStarted" | "dateFinished" | "rating";
type FilterOption = "All" | GameStatus;
type SortDirection = "asc" | "desc";

const sortOptions: { value: SortOption; label: string }[] = [
    { value: "dateAdded", label: "Date Added" },
    { value: "alphabetical", label: "A-Z" },
    { value: "dateStarted", label: "Date Started" },
    { value: "dateFinished", label: "Date Finished" },
    { value: "rating", label: "Rating" },
];

const filterOptions: FilterOption[] = ["All", "Plan to Play", "Started", "Finished", "Completed", "Continuous", "Paused", "Dropped"];

export default function GamesTab() {
    const insets = useSafeAreaInsets();
    const [games, setGames] = useState<Game[]>([]);
    const [loadingGames, setLoadingGames] = useState(true);
    const [error, setError] = useState<string | undefined>(undefined);
    const [sortBy, setSortBy] = useState<SortOption>("dateAdded");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [filterBy, setFilterBy] = useState<FilterOption>("All");
    const [searchFilters, setSearchFilters] = useState<string>("");
    const { user, loading: authLoading } = useAuthSession();
    const router = useRouter();

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            setGames([]);
            setLoadingGames(false);
            return;
        }

        fetchGames();
    }, [authLoading, user]);

    async function fetchGames() {
        setLoadingGames(true);
        setError(undefined);
        const { data, error } = await supabase.from("Games").select("*").eq("user_id", user?.id);

        setLoadingGames(false);

        if (!error && data) {
            setGames(data as unknown as Game[]);
        } else {
            setError(error?.message || "Failed to load games.");
        }
    }

    function parseSortableDate(value: string | null) {
        if (!value) {
            return Number.NEGATIVE_INFINITY;
        }

        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
    }

    function getDisplayedGames() {
        const filteredGames = filterBy === "All" ? games : games.filter((game) => (game.Status ?? "Unknown") === filterBy);

        const sortedGames = [...filteredGames];

        sortedGames.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case "alphabetical":
                    comparison = (a.Name ?? "").localeCompare(b.Name ?? "");
                    break;
                case "dateStarted":
                    comparison = parseSortableDate(a.Started) - parseSortableDate(b.Started);
                    break;
                case "dateFinished":
                    comparison = parseSortableDate(a.Finished) - parseSortableDate(b.Finished);
                    break;
                case "rating":
                    comparison = (a.Rating ?? Number.NEGATIVE_INFINITY) - (b.Rating ?? Number.NEGATIVE_INFINITY);
                    break;
                case "dateAdded":
                default:
                    comparison = a.id - b.id;
                    break;
            }

            return sortDirection === "asc" ? comparison : comparison * -1;
        });

        return sortedGames;
    }


    const getStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case "started":
                return "started";
            case "finished":
                return "finished";
            case "completed":
                return "completed";
            case "continuous":
                return "continuous";
            case "dropped":
                return "dropped";
            case "paused":
                return "paused";
            case "plan to play":
                return "plan to play";
            default:
                return "unknown";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "started":
                return "text-blue-500";
            case "finished":
                return "text-green-500";
            case "completed":
                return "text-amber-300";
            case "continuous":
                return "text-black dark:text-white";
            case "dropped":
                return "text-red-500";
            case "paused":
                return "text-slate-500";
            case "plan to play":
                return "text-indigo-500";
            default:
                return "text-slate-500";
        }
    };

    const renderStars = (rating: number | null) => {
        if (!rating) {
            return null;
        }

        const stars = [];
        const starRating = rating / 2;
        const fullStars = Math.floor(starRating);
        const hasHalfStar = starRating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <Text key={i} className="text-yellow-500 text-xs">
                        ★
                    </Text>
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <Text key={i} className="text-yellow-500 text-xs">
                        ☆
                    </Text>
                );
            } else {
                stars.push(
                    <Text key={i} className="text-gray-300 dark:text-gray-600 text-xs">
                        ★
                    </Text>
                );
            }
        }

        return <View className="flex-row">{stars}</View>;
    };

    const renderGameItem = ({ item }: { item: Game }) => (
        <Pressable
            className="bg-white dark:bg-gray-900 mx-4 mb-3 rounded-lg shadow-sm border border-indigo-300 p-4"
            onPress={() => router.push(`/screens/game-details?id=${item.id}`)}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
                        {item.Name}
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2" numberOfLines={1}>
                        {item["Developer/Publisher"]}
                    </Text>
                    {item.Rating && <View className="flex-row items-center">{renderStars(item.Rating)}</View>}
                </View>

                <View className="items-center">
                    <Text className={`text-xs font-medium capitalize ${getStatusColor(item.Status ?? "Unknown")}`}>
                        {getStatusLabel(item.Status ?? "Unknown")}
                    </Text>
                </View>
            </View>
        </Pressable>
    );

    const displayedGames = getDisplayedGames();

    if (authLoading) {
        return (
            <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-indigo-900 dark:to-blue-800">
                <View className="flex-1 flex-col items-center justify-center px-6">
                    <Text className="text-xl font-semibold text-foreground mb-2">Checking account...</Text>
                </View>
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <View className="flex-1 flex flex-col items-center justify-center px-6">
                    <Text className="text-xl font-semibold text-black dark:text-white mb-2">You are not logged in. Open the account page to sign in.</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <View className="flex-1 flex flex-col items-center justify-center px-6">
                    <Text className="text-xl font-semibold text-black dark:text-white mb-2">Oops! Something went wrong</Text>
                    <Text className="text-muted-foreground text-center mb-6">{error}</Text>
                    <Button title="Try Again" onPress={fetchGames} />
                </View>
            </View>
        );
    }

    if (loadingGames) {
        return (
            <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-indigo-900 dark:to-blue-800">
                <View className="flex-1 flex flex-col items-center justify-center px-6">
                    <Text className="text-xl font-semibold text-foreground mb-2">Loading...</Text>
                </View>
            </View>
        );
    }

    if (games.length === 0) {
        return (
            <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-indigo-900 dark:to-blue-800">
                <View className="flex-1 flex flex-col items-center justify-center px-6">
                    <Text className="text-xl font-semibold text-foreground mb-2">No games available</Text>
                    <Text className="text-black dark:text-white text-center mb-6">Your game library is empty. Start building your collection!</Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <AddGameButton />
            <FlatList
                data={displayedGames}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderGameItem}
                ListHeaderComponent={
                    <View className="px-4 pb-4">
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                            <View>
                                <Text className="mb-1 text-xs font-bold uppercase tracking-wide text-indigo-900 dark:text-gray-200">Sort</Text>
                                <Host matchContents>
                                    <Picker
                                        variant="menu"
                                        options={sortOptions.map((option) => option.label)}
                                        selectedIndex={sortOptions.findIndex((option) => option.value === sortBy)}
                                        onOptionSelected={({ nativeEvent: { index } }) => setSortBy(sortOptions[index].value)}
                                    />
                                </Host>
                            </View>

                            <View>
                                <Text className="mb-1 text-xs font-bold uppercase tracking-wide text-indigo-900 dark:text-gray-200">Order</Text>
                                <Host matchContents>
                                    <Picker
                                        variant="menu"
                                        options={["Ascending", "Descending"]}
                                        selectedIndex={sortDirection === "asc" ? 0 : 1}
                                        onOptionSelected={({ nativeEvent: { index } }) => setSortDirection(index === 0 ? "asc" : "desc")}
                                    />
                                </Host>
                            </View>

                            <View>
                                <Text className="mb-1 text-xs font-bold uppercase tracking-wide text-indigo-900 dark:text-gray-200">Filter</Text>
                                <Host matchContents>
                                    <Picker
                                        variant="menu"
                                        options={[...filterOptions]}
                                        selectedIndex={filterOptions.indexOf(filterBy)}
                                        onOptionSelected={({ nativeEvent: { index } }) => setFilterBy(filterOptions[index])}
                                    />
                                </Host>
                            </View>
                        </View>

                        {displayedGames.length === 0 ? (
                            <View className="mt-8 items-center justify-center rounded-xl border border-indigo-200 bg-white/80 px-6 py-10 dark:border-gray-700 dark:bg-gray-900/70">
                                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No matching games</Text>
                                <Text className="text-center text-gray-600 dark:text-gray-400">Try a different sort or clear the current status filter.</Text>
                            </View>
                        ) : null}
                    </View>
                }
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingTop: 76, paddingBottom: insets.bottom + 96 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
