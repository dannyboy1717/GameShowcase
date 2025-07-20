import { Stack } from 'expo-router';

export default function GamesTabStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Games List' }}
      />
    </Stack>
  );
}