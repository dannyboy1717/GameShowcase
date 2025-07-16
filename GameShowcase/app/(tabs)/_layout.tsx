import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform, View, Text, ActivityIndicator } from "react-native";

import * as Notifications from "expo-notifications";
import { LucideGamepad2, User } from "lucide-react-native";
import { HapticTab } from "../components/HapticTab";
import TabBarBackground from "../components/ui/TabBarBackground";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { initializeSupabase } from "../lib/supabase";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
});

export default function TabLayout() {
  const [supabaseInitialized, setSupabaseInitialized] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const colorScheme = useColorScheme();
  console.log("TabLayout colorScheme", colorScheme);
  useEffect(() => {
    prepare();
  }, []);

  useEffect(() => {
    initializeSupabase()
      .then(() => setSupabaseInitialized(true))
      .catch(err => setError(err.message || 'An unknown error occurred.'))
  }, [])

  if (error) {
    return (
      <View>
        <Text>Error initializing app: {error.message}</Text>
      </View>
    )
  }

  if (!supabaseInitialized) {
    return (
      <View className="background-white dark:bg-black flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
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
              ios: {
                // Use a transparent background on iOS to show the blur effect
                position: "absolute",
              },
              default: {},
            }),
          }}
        >
          <Tabs.Screen
            name="games"
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
    </QueryClientProvider>
  );
}
