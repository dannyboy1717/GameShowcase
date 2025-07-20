import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Game } from '../../types/Game'; // Adjust path if needed
import { useGames } from '../../lib/supabase';
import { VStack } from '@/components/ui/vstack';
import GameListItem from '../../components/ui/GameListItem';
import { Divider } from '@rneui/base';


function renderGames(games: Game[]) {
  const gameArray = games as Game[];
  return (
    <>
      {gameArray?.map((game) => (
        <React.Fragment key={game.id}>
          <GameListItem game={game} />
          {game.id !== gameArray[gameArray.length - 1].id && (
            <Divider key={`divider-${game.id}`} className="my-2" />
          )}
        </React.Fragment>
      ))}
      <View />
    </>
  );
}

export default function Games() {
  const { data, error, isLoading } = useGames();

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>Error fetching games: {error.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
        <ScrollView className='px-4'>
          <VStack space="md">{renderGames(data || [])}</VStack>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}