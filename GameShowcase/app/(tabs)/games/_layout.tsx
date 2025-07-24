import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { Stack } from 'expo-router';

const colorScheme = "dark"; // TODO: move this into a context or hook

export default function GamesTabStackLayout() {
  return (
    <GluestackUIProvider
      mode={colorScheme ?? "dark"}
      style={{ backgroundColor: colorScheme === "dark" ? "#000" : "#fff" }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="index" options={{ title: "Games List" }} />
      </Stack>
    </GluestackUIProvider>
  );
}