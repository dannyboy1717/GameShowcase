// app/(tabs)/_layout.tsx
// Remove Stack import and animation related imports if they were here
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, View, Text, ActivityIndicator } from "react-native";

import * as Notifications from "expo-notifications";
import { LucideGamepad2, User } from "lucide-react-native";
import { HapticTab } from "../components/HapticTab";
import TabBarBackground from "../components/ui/TabBarBackground";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";

// NO QueryClient, PersistQueryClientProvider, AsyncStorage imports here
import { initializeSupabase } from "../lib/supabase";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";


async function prepare() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.log("Error setting notification handler", e);
  }
}

// REMOVE QueryClient and persister setup from here
// const queryClient = new QueryClient({ ... });
// const asyncStoragePersister = createAsyncStoragePersister({ ... });
// persistQueryClient({ ... });


export default function TabLayout() {
  const [supabaseInitialized, setSupabaseInitialized] = useState(false); // Use useState from React
  const [error, setError] = useState<string | null>(null); // Error message is string
  const colorScheme = useColorScheme();
  
  useEffect(() => {
    prepare(); // Call notification setup
    
    // Initialize Supabase after notification setup
    initializeSupabase()
      .then(() => setSupabaseInitialized(true))
      .catch(err => setError(err.message || 'An unknown error occurred.'))
  }, []) // Empty dependency array means this runs once on mount

  // Conditional rendering based on Supabase initialization state
  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error initializing app: {error}</Text>
      </View>
    );
  }

  if (!supabaseInitialized) {
    return (
      <View className="bg-white dark:bg-black flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    // GluestackUIProvider should still wrap the Tabs for styling context
    <GluestackUIProvider mode={colorScheme ?? "dark"}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "dark"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: () => (
            <TabBarBackground colorScheme={colorScheme ?? "dark"} />
          ),
          tabBarStyle: Platform.select({
            ios: { position: "absolute" },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="games" // This links to app/(tabs)/games/index.tsx (or its _layout if it's a stack)
          options={{
            title: "Games",
            tabBarIcon: ({ color }) => <LucideGamepad2 color={color} />,
          }}
        />
        <Tabs.Screen
          name="user-management"
          options={{
            title: "User",
            tabBarIcon: ({ color }) => <User color={color} />,
          }}
        />
      </Tabs>
    </GluestackUIProvider>
  );
}