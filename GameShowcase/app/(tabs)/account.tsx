"use client"

import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native"
import { supabase } from "../lib/supabase"

export default function AccountTab() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setInitialLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn() {
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (signInError) {
      console.log(signInError);
      setError(signInError.message)
    } else {
      Alert.alert("Success", "Logged in successfully!")
      setEmail("")
      setPassword("")
    }
  }

  async function signUp() {
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
    } else {
      Alert.alert("Success", "Check your email for verification link!")
      setEmail("")
      setPassword("")
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      Alert.alert("Error", error.message)
    } else {
      Alert.alert("Success", "Signed out successfully!")
    }
  }

  // Show loading spinner while checking initial auth state
  if (initialLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Loading...</Text>
      </View>
    )
  }

  // Show user profile if signed in
  if (user) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 justify-center px-8">

          {/* User Information Card */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Account Information</Text>

            <View className="flex flex-col gap-3">
              <View>
                <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</Text>
                <Text className="text-base text-gray-800 dark:text-white">{user.email}</Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">User ID</Text>
                <Text className="text-base text-gray-800 dark:text-white font-mono text-xs">{user.id}</Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Account Created</Text>
                <Text className="text-base text-gray-800 dark:text-white">
                  {new Date(user.created_at).toLocaleDateString()}
                </Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Verified</Text>
                <View className="flex-row items-center">
                  <View
                    className={`w-2 h-2 rounded-full mr-2 ${user.email_confirmed_at ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <Text className="text-base text-gray-800 dark:text-white">
                    {user.email_confirmed_at ? "Verified" : "Not Verified"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity className="bg-red-600 dark:bg-red-500 rounded-lg py-4 items-center" onPress={signOut}>
            <Text className="text-white font-semibold text-base">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Show login form if not signed in
  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 justify-center px-8">
        {/* Header */}
        <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Welcome Back</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center">Sign in to your account to continue</Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <Text className="text-red-700 dark:text-red-400 text-center">{error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View className="space-y-4 flex flex-col gap-4">
          {/* Email Input */}
          <View>
            <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">Email</Text>
            <TextInput
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-4 text-gray-800 dark:text-white text-base"
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(text) => {
                setEmail(text)
                setError("")
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View>
            <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">Password</Text>
            <TextInput
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-4 text-gray-800 dark:text-white text-base"
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text)
                setError("")
              }}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            className={`bg-indigo-600 dark:bg-indigo-500 rounded-lg py-4 items-center mt-6 ${loading ? "opacity-70" : ""}`}
            onPress={signIn}
            disabled={loading}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-semibold text-base ml-2">Signing In...</Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-base">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            <Text className="mx-4 text-gray-500 dark:text-gray-400">or</Text>
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            className={`bg-white dark:bg-gray-800 border border-indigo-600 dark:border-indigo-500 rounded-lg py-4 items-center ${loading ? "opacity-70" : ""}`}
            onPress={signUp}
            disabled={loading}
          >
            <Text className="text-indigo-600 dark:text-indigo-400 font-semibold text-base">Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center mt-8">
          <TouchableOpacity>
            <Text className="text-indigo-600 dark:text-indigo-400 font-medium">Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
