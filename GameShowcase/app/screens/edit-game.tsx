"use client"

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
import { Game } from "../types/supabase"

export default function EditGameScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [game, setGame] = useState<Partial<Game>>({})

    useEffect(() => {
        if (id) {
            fetchGameDetails()
        }
    }, [id])

    const fetchGameDetails = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.from("Games").select("*").eq("id", id).single()

            if (error) throw error
            setGame(data)
        } catch (err: any) {
            Alert.alert("Error", "Failed to load game details")
            router.back()
        } finally {
            setLoading(false)
        }
    }

    const saveGame = async () => {
        try {
            setSaving(true)

            const { error } = await supabase
                .from("Games")
                .update(game)
                .eq("id", id)

            if (error) throw error

            Alert.alert("Success", "Game updated successfully!", [
                { text: "OK", onPress: () => router.back() }
            ])
        } catch (err: any) {
            Alert.alert("Error", "Failed to save game: " + err.message)
        } finally {
            setSaving(false)
        }
    }

    const updateField = (field: keyof Game, value: string) => {
        setGame(prev => ({ ...prev, [field]: value }))
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

    const StatusPicker = () => {
        const statuses = ["Wishlist", "Playing", "Started", "Completed", "Finished", "Paused", "Dropped"]

        return (
            <View className="mb-4">
                <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {statuses.map((status) => (
                        <TouchableOpacity
                            key={status}
                            className={`mr-2 px-4 py-2 rounded-full border ${game.Status === status
                                ? "bg-indigo-600 border-indigo-600"
                                : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                }`}
                            onPress={() => updateField("Status", status)}
                        >
                            <Text
                                className={`font-medium ${game.Status === status
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
        )
    }

    const RatingPicker = () => {
        const ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        console.log(game.Rating);
        return (
            <View className="mb-4">
                <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">Rating (1-10)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {ratings.map((rating) => (
                        <TouchableOpacity
                            key={rating}
                            className={`mr-2 w-10 h-10 rounded-full border items-center justify-center ${game.Rating === rating
                                ? "bg-yellow-400 border-yellow-400"
                                : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                }`}
                            onPress={() => updateField("Rating", rating.toString())}
                        >
                            <Text
                                className={`font-medium ${game.Rating === rating
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

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#6366f1" />
                <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading game details...</Text>
            </View>
        )
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
                        value={game.Name}
                        onChangeText={(text) => updateField("Name", text)}
                        placeholder="Enter game name"
                    />

                    <InputField
                        label="Developer/Publisher"
                        value={game["Developer/Publisher"]}
                        onChangeText={(text) => updateField("Developer/Publisher", text)}
                        placeholder="Enter developer or publisher"
                    />

                    <InputField
                        label="Platform"
                        value={game.Platform}
                        onChangeText={(text) => updateField("Platform", text)}
                        placeholder="e.g., PC, PlayStation, Xbox, Switch"
                    />

                    <StatusPicker />
                    <RatingPicker />
                </View>

                {/* Timeline */}
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                    <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Timeline</Text>

                    <InputField
                        label="Started Date"
                        value={game.Started}
                        onChangeText={(text) => updateField("Started", text)}
                        placeholder="YYYY-MM-DD"
                    />

                    <InputField
                        label="Finished Date"
                        value={game.Finished}
                        onChangeText={(text) => updateField("Finished", text)}
                        placeholder="YYYY-MM-DD"
                    />

                    <InputField
                        label="Playtime"
                        value={game.Playtime}
                        onChangeText={(text) => updateField("Playtime", text)}
                        placeholder="e.g., 25 hours, 3 days"
                    />
                </View>

                {/* Purchase Information */}
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                    <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Purchase Details</Text>

                    <InputField
                        label="Purchase Date"
                        value={game.Bought}
                        onChangeText={(text) => updateField("Bought", text)}
                        placeholder="YYYY-MM-DD"
                    />

                    <InputField
                        label="Cost"
                        value={game.Cost}
                        onChangeText={(text) => updateField("Cost", text)}
                        placeholder="e.g., $59.99, Free"
                        keyboardType="decimal-pad"
                    />
                </View>

                {/* Comments */}
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                    <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Comments</Text>

                    <InputField
                        label="Notes & Comments"
                        value={game.Comments}
                        onChangeText={(text) => updateField("Comments", text)}
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