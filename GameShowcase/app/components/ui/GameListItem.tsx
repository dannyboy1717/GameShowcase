import { Game } from "@/app/types/Game";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useNavigation } from "expo-router";

interface GameListItemProps {
  game: Game;
}

export default function GameListItem(props: GameListItemProps) {
  const navigation = useNavigation<any>();

  function goToDetails(game: Game): void {
    navigation.navigate("components/screens/game-details", { game });
  }

  return (
    <Pressable onPress={() => goToDetails(props.game)}>
      <Text className="text-lg font-semibold">
        {props.game.Name}
      </Text>
      <Text className="text-md">
        {props.game["Developer/Publisher"]}
      </Text>
    </Pressable>
  )
}