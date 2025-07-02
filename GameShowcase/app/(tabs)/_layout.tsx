import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';
import { HapticTab } from '../components/HapticTab';
import { IconSymbol } from '../components/ui/IconSymbol';
import TabBarBackground from '../components/ui/TabBarBackground';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

async function prepare() {
      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowList: true
          })
        });
      }
      catch (e) {
        console.log("Error setting notification handler", e);
      }
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  console.log("TabLayout colorScheme", colorScheme);
  useEffect(() => {
    prepare();
  }, [])

  return (
    <GluestackUIProvider mode={colorScheme ?? "dark"}><Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: () => <TabBarBackground colorScheme={colorScheme ?? "dark"}/>,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="games"
          options={{
            title: 'View',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="add-games"
          options={{
            title: 'Add',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />
      </Tabs></GluestackUIProvider>
  );
}
