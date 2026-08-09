import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import "@/global.css"

import AccountButton from '@/components/AccountButton';
import { AdsProvider } from '@/hooks/useAds';
import { AuthSessionProvider } from '@/hooks/useAuthSession';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GamesProvider } from '@/hooks/useGames';
import { ToastProvider } from '@/hooks/useToast';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* Auth is outermost — GamesProvider reads from it. */}
        <AuthSessionProvider>
          <AdsProvider>
            <GamesProvider>
              {/* Innermost so the toast renders above every screen. */}
              <ToastProvider>
                <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'none' }} />
                  <Stack.Screen name="screens/search-game" />
                  <Stack.Screen name="screens/add-game" />
                  <Stack.Screen name="screens/game-details" />
                  <Stack.Screen name="screens/edit-game" />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <AccountButton />
              </ToastProvider>
            </GamesProvider>
          </AdsProvider>
        </AuthSessionProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
