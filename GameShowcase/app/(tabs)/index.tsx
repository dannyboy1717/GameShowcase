"use client"

import { useState } from "react"
import { View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator } from "react-native"
import { supabase } from "../lib/supabase"

export default function AccountTab() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
      setError(signInError.message)
    } else {
      Alert.alert("Success", "Logged in successfully!")
      // Clear form
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

  return (
    <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
      <View className="flex-1 justify-center px-8">
        {/* Header */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-indigo-600 rounded-full items-center justify-center mb-6">
            <Text className="text-white text-2xl font-bold">S</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</Text>
          <Text className="text-gray-600 text-center">Sign in to your account to continue</Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <Text className="text-red-700 text-center">{error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View className="space-y-4">
          {/* Email Input */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Email</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-4 text-gray-800 text-base"
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
            <Text className="text-gray-700 font-medium mb-2">Password</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-4 text-gray-800 text-base"
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
            className={`bg-indigo-600 rounded-lg py-4 items-center mt-6 ${loading ? "opacity-70" : ""}`}
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
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            className={`bg-white border border-indigo-600 rounded-lg py-4 items-center ${loading ? "opacity-70" : ""}`}
            onPress={signUp}
            disabled={loading}
          >
            <Text className="text-indigo-600 font-semibold text-base">Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center mt-8">
          <TouchableOpacity>
            <Text className="text-indigo-600 font-medium">Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
