// app/_layout.tsx
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { Stack } from "expo-router"; // Use Stack here if this is the root
import React from "react";

// React Query / Persistence Imports
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
// Only if you use CardStyleInterpolators:
// import { CardStyleInterpolators } from '@react-navigation/stack';


// Initialize QueryClient and Persister outside the component
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

export default function RootAppLayout() {
  // Use a state for color scheme if needed globally here
  const colorScheme = 'dark'; // Or use your useColorScheme hook if defined globally

  return (
    // --- KEY CHANGE: PersistQueryClientProvider is at the very top ---
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
      onSuccess={() => {
        console.log("React Query cache successfully restored.");
      }}
      // You can add onBeforeRestore if you need a loading state specific to cache restoration
    >
      <GluestackUIProvider mode={colorScheme ?? "dark"}>
        {/*
          This Stack Navigator is the global one.
          It will contain your (tabs) group and any standalone screens like GameDetailScreen.
        */}
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
            animationDuration: 100
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="screens/GameDetailScreen"
            options={{
              presentation: 'card',
              headerShown: false,
            }}
          />
        </Stack>
      </GluestackUIProvider>
    </PersistQueryClientProvider>
  );
}