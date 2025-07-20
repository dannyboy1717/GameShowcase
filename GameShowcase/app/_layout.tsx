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
  const colorScheme = 'dark';

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <GluestackUIProvider mode={colorScheme ?? "light"}>
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