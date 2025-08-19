"use client"

import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { supabase } from "../lib/supabase"
import { Game } from "../types/supabase"

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
      setError(err.message)
      Alert.alert("Error", "Failed to load game details")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"

    switch (status.toLowerCase()) {
      case "completed":
      case "finished":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400"
      case "playing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "started":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "wishlist":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "dropped":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getPlatformIcon = (platform: string | null) => {
    if (!platform) return "🎮"

    switch (platform.toLowerCase()) {
      case "pc":
      case "steam":
        return "💻"
      case "playstation":
      case "ps4":
      case "ps5":
      case "xbox":
      case "switch":
        return "🎮"
      case "mobile":
      case "ios":
      case "android":
        return "📱"
      default:
        return "🎮"
    }
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return <Text className="text-gray-400 dark:text-gray-500">No rating</Text>

    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Text key={i} className="text-yellow-400 text-lg">
            ★
          </Text>,
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Text key={i} className="text-yellow-400 text-lg">
            ☆
          </Text>,
        )
      } else {
        stars.push(
          <Text key={i} className="text-gray-300 dark:text-gray-600 text-lg">
            ★
          </Text>,
        )
      }
    }
    return (
      <View className="flex-row items-center">
        <View className="flex-row">{stars}</View>
        <Text className="ml-2 text-gray-600 dark:text-gray-400 font-medium">{(rating / 2)}/5</Text>
      </View>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString // Return as-is if not a valid date
    }
  }

  const InfoRow = ({ label, value, icon }: { label: string; value: string | null; icon?: string }) => (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
      <View className="flex-row items-center flex-1">
        {icon && <Text className="mr-2 text-lg">{icon}</Text>}
        <Text className="text-gray-600 dark:text-gray-400 font-medium">{label}</Text>
      </View>
      <Text className="text-gray-800 dark:text-white font-medium flex-1 text-right" numberOfLines={2}>
        {value || "Not specified"}
      </Text>
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

  if (error || !game) {
    return (
      <View className="flex-1 justify-center items-center px-8">
        <Text className="text-red-600 dark:text-red-400 text-lg font-medium mb-4">Failed to load game details</Text>
        <TouchableOpacity
          className="bg-indigo-600 dark:bg-indigo-500 px-6 py-3 rounded-lg"
          onPress={fetchGameDetails}
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <TouchableOpacity className="self-start mb-4 p-2 -ml-2" onPress={() => router.back()}>
          <Text className="text-indigo-600 dark:text-indigo-400 text-base font-medium">← Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-2" numberOfLines={3}>
          {game.Name || "Untitled Game"}
        </Text>

        <Text className="text-gray-600 dark:text-gray-400 mb-4">
          {game["Developer/Publisher"] || "Unknown Developer"}
        </Text>

        {/* Rating and Status */}
        <View className="flex-row items-center justify-between mb-6">
          {renderStars(game.Rating)}
          <View className={`px-3 py-1 rounded-full ${getStatusColor(game.Status)}`}>
            <Text className="text-sm font-medium capitalize">{game.Status || "Unknown"}</Text>
          </View>
        </View>
      </View>

      {/* Game Information Cards */}
      <View className="flex flex-col px-6 gap-6">
        {/* Basic Information */}
        <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Game Information</Text>
          <InfoRow label="Platform" value={game.Platform} icon={getPlatformIcon(game.Platform)} />
          {game.Playtime && (
            <InfoRow label="Playtime" value={game.Playtime} icon="⏱️" />
          )}

          <InfoRow label="Status" value={game.Status} icon="📊" />
        </View>

        {/* Timeline */}
        {(game.Started || game.Finished) && (
          <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Timeline</Text>
            <InfoRow label="Started" value={game.Started ?? "Unknown"} icon="🚀" />
            <InfoRow label="Finished" value={game.Finished ?? "Unknown"} icon="🏁" />
          </View>
        )}

        {/* Purchase Information */}
        {game.Bought && (
          <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Purchase Details</Text>
            <InfoRow label="Purchase Date" value={formatDate(game.Bought)} icon="🛒" />
            <InfoRow label="Cost" value={game.Cost} icon="💰" />
          </View>
        )}


        {/* Comments */}
        {game.Comments && (
          <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Comments</Text>
            <Text className="text-gray-700 dark:text-gray-300 leading-6">{game.Comments}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex gap-3 pb-8">
          <TouchableOpacity className="flex-1 bg-indigo-600 dark:bg-indigo-500 py-4 rounded-lg items-center" onPress={() => router.push(`/screens/edit-game?id=${game.id}`)}>
            <Text className="text-white font-semibold">Edit Game</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-gray-200 dark:bg-gray-700 py-4 rounded-lg items-center">
            <Text className="text-gray-800 dark:text-gray-200 font-semibold">Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}
