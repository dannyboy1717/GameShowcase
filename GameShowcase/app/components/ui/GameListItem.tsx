import { Game } from "@/app/types/Game";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";

interface GameListItemProps {
  game: Game;
}

export default function GameListItem(props: GameListItemProps) {

  return (
    <Pressable onPress={() => console.log(`Selected game: ${props.game.Name}`)}>
      <Text className="text-lg font-semibold">
        {props.game.Name}
      </Text>
      <Text className="text-md">
        {props.game["Developer/Publisher"]}
      </Text>
    </Pressable>
  )
}